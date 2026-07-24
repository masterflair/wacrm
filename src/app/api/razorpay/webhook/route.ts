import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabaseAdmin = createAdminClient();

    // Handle different Razorpay events
    if (event.event === "subscription.charged" || event.event === "subscription.activated") {
      const subscription = event.payload.subscription.entity;
      const account_id = subscription.notes?.account_id;

      if (account_id) {
        // Upsert into subscriptions table
        await supabaseAdmin
          .from("subscriptions")
          .upsert(
            {
              account_id,
              razorpay_subscription_id: subscription.id,
              razorpay_plan_id: subscription.plan_id,
              status: subscription.status,
              current_start: subscription.current_start ? new Date(subscription.current_start * 1000).toISOString() : null,
              current_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
            },
            { onConflict: "razorpay_subscription_id" }
          );

        const plan_id = subscription.plan_id;
        const PLAN_ID_TO_TIER: Record<string, string> = {
          "plan_TGlmOwr6WFViTm": "starter",
          "plan_TGlmP9jI9GAgiW": "pro",
          "plan_TGlowI487XtXtu": "enterprise",
          "plan_TGm2jZqWasg4gv": "starter",
          "plan_TGm2krRDX0Cz7Z": "pro",
          "plan_TGm2l5UsC0DXUT": "enterprise",
        };
        const plan_tier = PLAN_ID_TO_TIER[plan_id] || "pro";

        // Update accounts table status & plan tier
        await supabaseAdmin
          .from("accounts")
          .update({ 
            subscription_status: subscription.status === "authenticated" ? "active" : subscription.status,
            plan_tier: plan_tier
          })
          .eq("id", account_id);
      }
    } else if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      const subscription = event.payload.subscription.entity;
      const account_id = subscription.notes?.account_id;

      if (account_id) {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
          })
          .eq("razorpay_subscription_id", subscription.id);

        await supabaseAdmin
          .from("accounts")
          .update({ subscription_status: subscription.status })
          .eq("id", account_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[POST /api/razorpay/webhook] error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
