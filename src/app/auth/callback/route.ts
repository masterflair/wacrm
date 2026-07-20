import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Resolve the correct public origin (handles proxies/Vercel/Hostinger)
  const getOrigin = () => {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (explicit) return explicit.replace(/\/+$/, "");

    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    if (forwardedHost) {
      return `${forwardedProto || "https"}://${forwardedHost}`;
    }

    const host = request.headers.get("host")?.trim();
    if (host) {
      const reqProto = new URL(request.url).protocol.replace(":", "");
      return `${reqProto}://${host}`;
    }
    return new URL(request.url).origin;
  };

  const origin = getOrigin();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth-failed`);
}
