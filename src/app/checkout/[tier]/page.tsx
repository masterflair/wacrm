"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { PRICING_PLANS, type Currency } from "@/lib/pricing-plans";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, account, loading: authLoading } = useAuth();
  
  const tier = params.tier as string;
  const currency = (searchParams.get("currency") as Currency) || "USD";
  const billing = searchParams.get("billing") || "monthly";

  const [address, setAddress] = useState("");
  const [stateName, setStateName] = useState("");
  const [gstin, setGstin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize form with existing account data if available
  useEffect(() => {
    if (account) {
      if (account.address) setAddress(account.address);
      if (account.state) setStateName(account.state);
      if (account.tax_id) setGstin(account.tax_id);
    }
  }, [account]);

  // Handle Authentication Redirect
  useEffect(() => {
    if (!authLoading && !user) {
      const currentUrl = `/checkout/${tier}?currency=${currency}&billing=${billing}`;
      router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, authLoading, router, tier, currency, billing]);

  const plan = PRICING_PLANS.find(p => p.key === tier);
  
  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
          <Link href="/pricing">
            <Button variant="outline">Return to Pricing</Button>
          </Link>
        </div>
      </div>
    );
  }

  const planId = plan.planIds[currency];
  const isAnnual = billing === "yearly";
  const basePrice = isAnnual ? plan.prices[currency].yearly : plan.prices[currency].monthly;
  const symbol = currency === "INR" ? "₹" : "$";

  // Calculate GST only for INR
  const gstRate = 0.18;
  const isINR = currency === "INR";
  const gstAmount = isINR ? basePrice * gstRate : 0;
  const totalAmount = basePrice + gstAmount;

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

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // Create subscription and save billing details
      const res = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan_id: planId,
          address,
          state: stateName,
          tax_id: gstin
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subscription");

      const { subscription_id, customer_id, isUpgrade } = data;

      if (isUpgrade) {
        toast.success("Subscription upgraded successfully with proration!");
        router.push("/dashboard");
        return;
      }

      // Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,
        customer_id: customer_id,
        name: "RenderAura CRM",
        description: `Subscription: ${plan.name} (${billing})`,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "rzp-verify" });
            
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId,
                plan_tier: tier,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            toast.success("Payment verified! Your subscription is active.", { id: "rzp-verify" });
            router.push("/dashboard");
          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            toast.error(verifyErr.message || "Failed to verify payment", { id: "rzp-verify" });
          }
        },
        theme: {
          color: "#8b5cf6", // Primary violet theme
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/pricing" className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <span className="text-sm font-medium">Back to Pricing</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-semibold tracking-tight">Secure Checkout</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-8 items-start">
          
          {/* Left Column: Billing Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Complete your purchase</h1>
              <p className="text-muted-foreground">Enter your billing details below to generate a tax-compliant invoice.</p>
            </div>

            <Card className="border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl">Billing Information</CardTitle>
                <CardDescription>Required for accurate invoicing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Billing Address</Label>
                  <Input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="123 Tech Park, Phase 1..."
                    className="bg-black/20 border-white/10 text-white placeholder:text-muted-foreground/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State / Region</Label>
                    {isINR ? (
                      <Select value={stateName} onValueChange={(val) => setStateName(val || "")}>
                        <SelectTrigger className="bg-black/20 border-white/10 text-white">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {INDIAN_STATES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={stateName} 
                        onChange={(e) => setStateName(e.target.value)} 
                        placeholder="State or Province"
                        className="bg-black/20 border-white/10 text-white"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                      GSTIN / Tax ID
                      <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Input 
                      value={gstin} 
                      onChange={(e) => setGstin(e.target.value)} 
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      className="bg-black/20 border-white/10 text-white uppercase"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500" />
              Your payment information is processed securely by Razorpay.
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="sticky top-24">
            <Card className="border-primary/20 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary),0.1)]">
              <CardHeader className="border-b border-white/5 pb-6">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Plan Details */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {isAnnual ? "Annual Subscription" : "Monthly Subscription"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg text-white">
                      {symbol}{basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">/ {isAnnual ? "year" : "month"}</p>
                  </div>
                </div>

                {/* Subtotal & GST */}
                <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{symbol}{basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {isINR && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST (18%)</span>
                      <span>{symbol}{gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="font-bold text-white text-xl">Total due today</span>
                  <span className="font-bold text-primary text-2xl">
                    {symbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-xl text-md font-bold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02]"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing Payment...
                    </>
                  ) : (
                    `Pay ${symbol}${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} via Razorpay`
                  )}
                </Button>

              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/80 bg-white/5 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Instant access to {plan.name} features</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80 bg-white/5 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span>Cancel your subscription anytime</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
