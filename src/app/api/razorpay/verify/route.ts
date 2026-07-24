import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { requireRole, toErrorResponse } from "@/lib/auth/account";

// Plan ID to Tier mapping
const PLAN_ID_TO_TIER: Record<string, string> = {
  // USD Plans
  "plan_TGlmOwr6WFViTm": "starter",
  "plan_TGlmP9jI9GAgiW": "pro",
  "plan_TGlowI487XtXtu": "enterprise",
  "plan_TGmXXWDFaRq6vQ": "starter",
  "plan_TGmXXkR7xQ2gpm": "pro",
  "plan_TGmXXzQz24mlbQ": "enterprise",

  // INR Plans
  "plan_TGm2jZqWasg4gv": "starter",
  "plan_TGm2krRDX0Cz7Z": "pro",
  "plan_TGm2l5UsC0DXUT": "enterprise",
  "plan_TGmXYGAJy5kXuB": "starter",
  "plan_TGmXYV1NGvMORI": "pro",
  "plan_TGmXZ6TpRjSXg8": "enterprise",
};

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("admin");
    const body = await request.json();

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      plan_id,
      plan_tier: requested_tier,
    } = body;

    if (!razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required subscription verification fields" },
        { status: 400 }
      );
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay API keys are not configured" },
        { status: 500 }
      );
    }

    // Verify HMAC SHA256 Signature
    // Format for subscription verification: razorpay_payment_id + '|' + razorpay_subscription_id
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    const isSignatureValid = generated_signature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("[POST /api/razorpay/verify] Invalid Signature match");
      return NextResponse.json(
        { error: "Invalid payment signature verification" },
        { status: 400 }
      );
    }

    // Determine plan_tier
    const plan_tier =
      requested_tier || PLAN_ID_TO_TIER[plan_id] || "pro";

    const razorpay = new Razorpay({ key_id, key_secret });

    // Fetch subscription entity details from Razorpay
    let subEntity: any = null;
    try {
      subEntity = await razorpay.subscriptions.fetch(razorpay_subscription_id);
    } catch (fetchErr) {
      console.warn("Could not fetch subscription entity from Razorpay, using payload defaults:", fetchErr);
    }

    const current_start = subEntity?.current_start
      ? new Date(subEntity.current_start * 1000).toISOString()
      : new Date().toISOString();
    const current_end = subEntity?.current_end
      ? new Date(subEntity.current_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Upsert into public.subscriptions table
    const { error: subInsertError } = await ctx.supabase
      .from("subscriptions")
      .upsert(
        {
          account_id: ctx.accountId,
          razorpay_subscription_id,
          razorpay_plan_id: plan_id || subEntity?.plan_id || "unknown",
          status: "active",
          current_start,
          current_end,
        },
        { onConflict: "razorpay_subscription_id" }
      );

    if (subInsertError) {
      console.error("[POST /api/razorpay/verify] subscriptions upsert error:", subInsertError);
    }

    // 2. Update public.accounts table with subscription_status and plan_tier
    const updatePayload: Record<string, any> = { subscription_status: "active" };
    try {
      updatePayload.plan_tier = plan_tier;
      const { error: accountUpdateError } = await ctx.supabase
        .from("accounts")
        .update(updatePayload)
        .eq("id", ctx.accountId);

      if (accountUpdateError) {
        console.warn("[POST /api/razorpay/verify] accounts plan_tier update failed, falling back to subscription_status only:", accountUpdateError.message);
        await ctx.supabase
          .from("accounts")
          .update({ subscription_status: "active" })
          .eq("id", ctx.accountId);
      }
    } catch (updateErr) {
      console.warn("Falling back to subscription_status update:", updateErr);
      await ctx.supabase
        .from("accounts")
        .update({ subscription_status: "active" })
        .eq("id", ctx.accountId);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription verified and activated successfully",
      account_id: ctx.accountId,
      plan_tier,
      subscription_id: razorpay_subscription_id,
    });
  } catch (err: any) {
    console.error("[POST /api/razorpay/verify] Error:", err);
    return toErrorResponse(err);
  }
}
