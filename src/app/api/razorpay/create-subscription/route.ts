import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    // Only admins (account owners) can initiate subscriptions
    const ctx = await requireRole("admin");

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay API keys are not configured in environment variables." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const body = await request.json().catch(() => ({}));
    const plan_id = body.plan_id || process.env.NEXT_PUBLIC_RAZORPAY_DEFAULT_PLAN_ID;

    if (!plan_id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // 1. Fetch current account to check for existing customer_id
    const { data: account, error: accountError } = await ctx.supabase
      .from("accounts")
      .select("id, name, razorpay_customer_id, subscription_status")
      .eq("id", ctx.accountId)
      .single();

    if (accountError || !account) {
      console.error("[POST /api/razorpay/create-subscription] account error details:", accountError);
      if (accountError?.code === "42703") {
        return NextResponse.json(
          { error: "Database migration missing: Please run the Razorpay SQL migration in your Supabase SQL Editor." },
          { status: 500 }
        );
      }
      throw new Error(`Account query failed: ${accountError?.message || "Account not found"}`);
    }

    let customer_id = account.razorpay_customer_id;

    // 2. Create customer if one doesn't exist
    if (!customer_id) {
      const customer = await razorpay.customers.create({
        name: account.name,
        notes: {
          account_id: account.id,
        },
      });
      customer_id = customer.id;

      // Update account with new customer_id
      const { error: updateError } = await ctx.supabase
        .from("accounts")
        .update({ razorpay_customer_id: customer_id })
        .eq("id", account.id);

      if (updateError) {
        throw new Error("Failed to link Razorpay customer to account");
      }
    }

    // 3. Check if user already has an active subscription
    if (account.subscription_status === "active") {
      const { data: existingSub, error: existingSubError } = await ctx.supabase
        .from("subscriptions")
        .select("razorpay_subscription_id, razorpay_plan_id")
        .eq("account_id", account.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!existingSubError && existingSub && existingSub.razorpay_plan_id !== plan_id) {
        // Upgrade existing subscription!
        try {
          const updatedSub = await razorpay.subscriptions.update(
            existingSub.razorpay_subscription_id,
            {
              plan_id: plan_id,
              schedule_change_at: "now",
              customer_notify: 1, // Notify customer about the upgrade
            }
          );

          // Update backend DB with the new plan details immediately
          await ctx.supabase
            .from("subscriptions")
            .update({ razorpay_plan_id: plan_id })
            .eq("razorpay_subscription_id", existingSub.razorpay_subscription_id);

          return NextResponse.json({ 
            subscription_id: updatedSub.id, 
            customer_id: customer_id,
            isUpgrade: true,
            status: updatedSub.status
          });
        } catch (upgradeErr: any) {
          console.error("Failed to upgrade existing subscription:", upgradeErr);
          // If upgrade fails, we shouldn't necessarily fall back to creating a new one to avoid double billing.
          return NextResponse.json(
            { error: "Failed to upgrade existing subscription. Please contact support." },
            { status: 500 }
          );
        }
      }
    }

    // 4. Create New Subscription
    const subscriptionOptions = {
      plan_id: plan_id,
      total_count: 120, // Example: 10 years for monthly billing
      notes: {
        account_id: account.id,
      },
    };
    
    const subscription = (await razorpay.subscriptions.create(
      subscriptionOptions
    )) as any;

    return NextResponse.json({ 
      subscription_id: subscription.id, 
      customer_id: customer_id,
      isUpgrade: false
    });
  } catch (err: any) {
    console.error("[POST /api/razorpay/create-subscription] error:", err);
    return toErrorResponse(err);
  }
}
