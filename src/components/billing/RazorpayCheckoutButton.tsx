"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RazorpayCheckoutButtonProps {
  planId?: string;
  planTier?: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: boolean;
}

export function RazorpayCheckoutButton({ 
  planId, 
  planTier,
  label = "Upgrade Now", 
  variant = "default", 
  className,
  disabled = false,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // 1. Create a subscription on our backend
      const res = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subscription");

      const { subscription_id, customer_id, isUpgrade } = data;

      if (isUpgrade) {
        toast.success("Subscription upgraded successfully with proration!");
        window.location.reload();
        return;
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,
        customer_id: customer_id,
        name: "RenderAura CRM",
        description: "SaaS Subscription Plan",
        handler: async function (response: any) {
          try {
            toast.loading("Verifying subscription payment with database...", { id: "rzp-verify" });
            
            // 3. Verify payment signature & populate public.subscriptions + accounts tables
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId,
                plan_tier: planTier,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            toast.success("Payment verified! Your subscription is active.", { id: "rzp-verify" });
            window.location.reload();
          } catch (verifyErr: any) {
            console.error("Subscription verification failed:", verifyErr);
            toast.error(verifyErr.message || "Failed to activate subscription. Please contact support.", { id: "rzp-verify" });
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Checkout cancelled.");
          }
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();

    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      disabled={loading || disabled} 
      variant={variant}
      className={className || "w-full"}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? "Initializing..." : label}
    </Button>
  );
}
