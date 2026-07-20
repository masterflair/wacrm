import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getWhatsAppAccountsFromToken } from '@/lib/whatsapp/oauth'
import { registerPhoneNumber } from '@/lib/whatsapp/meta-api'
import { encrypt } from '@/lib/whatsapp/encryption'

async function resolveAccountId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data?.account_id) return null
  return data.account_id as string
}

let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = await resolveAccountId(supabase, user.id)
    if (!accountId) {
      return NextResponse.json(
        { error: 'Your profile is not linked to an account.' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { accessToken } = body

    if (!accessToken) {
      return NextResponse.json(
        { error: 'accessToken is required' },
        { status: 400 }
      )
    }

    // 1. Fetch available accounts from Meta using the provided token
    const accounts = await getWhatsAppAccountsFromToken(accessToken)
    if (accounts.length === 0) {
      return NextResponse.json(
        { error: 'No WhatsApp Business Accounts found for this Facebook user.' },
        { status: 404 }
      )
    }

    // For simplicity in this automated flow, we just pick the first available phone number
    const targetAccount = accounts[0]
    const { phone_number_id, waba_id } = targetAccount

    // 2. Reject if another account claimed this phone_number_id
    const { data: claimed, error: claimedError } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('account_id')
      .eq('phone_number_id', phone_number_id)
      .neq('account_id', accountId)
      .maybeSingle()

    if (claimedError) {
      console.error('Error checking phone_number_id ownership:', claimedError)
      return NextResponse.json(
        { error: 'Failed to validate configuration' },
        { status: 500 }
      )
    }

    if (claimed) {
      return NextResponse.json(
        {
          error:
            'This WhatsApp phone number is already linked to another account on this instance.',
        },
        { status: 409 }
      )
    }

    // 3. Register the phone number with Meta
    let registrationError = null
    try {
      await registerPhoneNumber({
        phoneNumberId: phone_number_id,
        accessToken: accessToken,
        pin: '' // assuming no 2-step pin is required for embedded signup test numbers, or we handle it later
      })
    } catch (err: any) {
      console.warn('Registration skipped or failed:', err.message)
      registrationError = err.message
    }

    // 4. Save to Database
    // Encrypt the token
    const encryptedToken = encrypt(accessToken)
    // Generate a secure random verify token for webhooks
    const verifyToken = crypto.randomUUID().replace(/-/g, '')

    const { error: upsertError } = await supabase
      .from('whatsapp_config')
      .upsert(
        {
          account_id: accountId,
          phone_number_id,
          waba_id,
          access_token: encryptedToken,
          verify_token: verifyToken,
          status: 'connected',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'account_id',
        }
      )

    if (upsertError) {
      console.error('Error saving whatsapp_config:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save configuration to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      phone_number_id,
      waba_id,
      warning: registrationError
    })
  } catch (error) {
    console.error('Error in WhatsApp OAuth POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
