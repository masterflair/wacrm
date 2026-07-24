"use client";

import { useEffect, useState } from "react";
import { Zap, Check, ShieldCheck, Lock, Sparkles, MessageSquare, Users, Database, Layers, Globe, ChevronDown, ChevronUp, X } from "lucide-react";
import { SettingsPanelHead } from "./settings-panel-head";
import { RazorpayCheckoutButton } from "@/components/billing/RazorpayCheckoutButton";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSimpleId } from "@/lib/id-formatter";

type Currency = "USD" | "INR";

const FEATURE_COMPARISON_CATEGORIES = [
  {
    category: "Messaging & WhatsApp API Infrastructure",
    items: [
      { name: "Official Meta WhatsApp API Connection", starter: true, pro: true, enterprise: true },
      { name: "Connected WhatsApp Numbers", starter: "1 Number", pro: "1 Number", enterprise: "Multi-Numbers (Multi-WABA)" },
      { name: "Included Monthly Messages", starter: "10,000 / mo", pro: "50,000 / mo", enterprise: "Unlimited (Dedicated Server)" },
      { name: "0% Commission Markup on Meta Messages", starter: true, pro: true, enterprise: true },
      { name: "Bulk Broadcast & Campaign Sender", starter: true, pro: true, enterprise: true },
    ]
  },
  {
    category: "Team Seats & Workspace Organization",
    items: [
      { name: "Included Operator Seats", starter: "3 Seats Included", pro: "5 Seats Included", enterprise: "10 Seats Included" },
      { name: "Extra Seat Add-On Fee", starter: "+$5 / ₹399 per mo", pro: "+$7 / ₹499 per mo", enterprise: "+$10 / ₹699 per mo" },
      { name: "Multi-Department Workspaces (Sales, Support)", starter: false, pro: false, enterprise: true },
      { name: "Shared Customer Team Inbox", starter: true, pro: true, enterprise: true },
    ]
  },
  {
    category: "AI & Automation Capabilities",
    items: [
      { name: "24/7 AI Copilot Assistant (Auto-Drafts)", starter: false, pro: true, enterprise: true },
      { name: "AI Agent Trained on Private Company PDFs & Docs", starter: false, pro: false, enterprise: true },
      { name: "No-Code Lead Auto-Assign & Follow-up Bot", starter: false, pro: true, enterprise: true },
      { name: "Smart Customer Lead Tags & Filters", starter: true, pro: true, enterprise: true },
    ]
  },
  {
    category: "Sales CRM & Pipeline Management",
    items: [
      { name: "Visual Kanban Sales Pipeline (Drag & Drop)", starter: false, pro: "1 Pipeline", enterprise: "Unlimited Pipelines" },
      { name: "Instant Quotations & Invoice PDF Builder", starter: true, pro: true, enterprise: true },
    ]
  },
  {
    category: "APIs, Integrations & Onboarding",
    items: [
      { name: "Developer REST APIs & Webhooks", starter: false, pro: false, enterprise: true },
      { name: "Custom ERP & CRM System Sync", starter: false, pro: false, enterprise: true },
      { name: "Support & Onboarding Tier", starter: "Standard Email Support", pro: "Priority Email & Chat", enterprise: "1-on-1 White-Glove Onboarding + 99.99% SLA" },
    ]
  }
];

interface PlanConfig {
  planIds: {
    USD: string;
    INR: string;
  };
  name: string;
  badge?: string;
  tagline: string;
  description: string;
  popular?: boolean;
  prices: {
    USD: { monthly: number; yearly: number };
    INR: { monthly: number; yearly: number };
  };
  features: string[];
}

const TEST_PLANS: PlanConfig[] = [
  {
    planIds: {
      USD: "plan_TGlmOwr6WFViTm",
      INR: "plan_TGm2jZqWasg4gv"
    },
    name: "Starter",
    tagline: "⚡ Best Value for Solo Sellers & Fast Launch",
    description: "Launch your official WhatsApp CRM in minutes with zero setup friction.",
    prices: {
      USD: { monthly: 9, yearly: 7 },
      INR: { monthly: 899, yearly: 719 }
    },
    features: [
      "3 Included User Seats (+$5 / ₹399 per extra seat)",
      "1 Connected WhatsApp Business Number",
      "10,000 High-Speed Messages / month Included",
      "Shared Customer Team Inbox & Contact CRM",
      "Instant PDF Quotation & Invoice Builder",
      "Smart Lead Tags & Customer Filters"
    ]
  },
  {
    planIds: {
      USD: "plan_TGlmP9jI9GAgiW",
      INR: "plan_TGm2krRDX0Cz7Z"
    },
    name: "Pro Plan",
    badge: "🔥 MOST POPULAR",
    tagline: "For Growing Sales Teams & High Velocity",
    description: "Automate sales, capture 100% of leads, and close deals 3x faster with AI.",
    popular: true,
    prices: {
      USD: { monthly: 19, yearly: 15 },
      INR: { monthly: 1899, yearly: 1519 }
    },
    features: [
      "5 Included Team Seats (+$7 / ₹499 per extra seat)",
      "1 Connected WhatsApp Business Number",
      "50,000 High-Speed Messages / month",
      "Visual Kanban Sales Pipeline (Drag & Drop)",
      "24/7 AI Copilot (Auto-Drafts & Answers)",
      "No-Code Lead Auto-Assign & Follow-up Bot",
      "Instant Quotations & Invoices Generator"
    ]
  },
  {
    planIds: {
      USD: "plan_TGlowI487XtXtu",
      INR: "plan_TGm2l5UsC0DXUT"
    },
    name: "Enterprise",
    tagline: "For Multi-Brand Corporate Scale & Integration",
    description: "Multi-number WhatsApp suite, custom-trained AI, developer APIs, and dedicated SLA.",
    prices: {
      USD: { monthly: 49, yearly: 39 },
      INR: { monthly: 4899, yearly: 3919 }
    },
    features: [
      "10 Included Team Seats (+$10 / ₹699 per extra seat)",
      "Multi-WhatsApp Numbers Support (Multi-WABA)",
      "Unlimited Messages & Dedicated Delivery Server",
      "Custom-Trained AI Agent on Company PDFs & FAQs",
      "Unlimited CRM Pipelines & Multi-Department Workspaces",
      "Developer REST APIs, Webhooks & ERP Sync",
      "White-Glove Onboarding & Dedicated Account Engineer"
    ]
  }
];

export function BillingPanel() {
  const { account } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("loading...");
  const [planTier, setPlanTier] = useState<string>("starter");
  const [customerInfo, setCustomerInfo] = useState<{ customerId?: string }>({});
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const langs = navigator.languages || [navigator.language || ""];
      const isIndia = tz.includes("Kolkata") || tz.includes("Calcutta") || langs.some(l => l.toLowerCase().includes("in"));
      if (isIndia) setCurrency("INR");
    } catch (e) {}
  }, []);

  useEffect(() => {
    async function fetchStatus() {
      if (!account?.id) return;
      
      const supabase = createClient();

      const { data, error } = await supabase
        .from("accounts")
        .select("subscription_status, razorpay_customer_id, plan_tier, trial_ends_at")
        .eq("id", account.id)
        .single();

      if (!error && data) {
        setSubscriptionStatus(data.subscription_status || "inactive");
        setPlanTier(data.plan_tier || "starter");
        setCustomerInfo({ customerId: data.razorpay_customer_id || undefined });
      } else {
        setSubscriptionStatus("inactive");
        setPlanTier("starter");
      }
    }
    fetchStatus();
  }, [account]);

  const isActive = subscriptionStatus === "active" || subscriptionStatus === "authenticated";
  const isTrial = subscriptionStatus === "trialing" || subscriptionStatus === "inactive";
  const symbol = currency === "INR" ? "₹" : "$";

  const getPlanDisplayName = () => {
    if (isActive) {
      if (planTier === "enterprise") return "Enterprise Plan Subscription";
      if (planTier === "pro") return "Pro Plan Subscription";
      return "Starter Plan Subscription";
    }
    if (isTrial) return "Pro Plan (7-Day Free Trial)";
    return "Starter Plan (Free Tier)";
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Billing & Plans"
        description="Manage your SaaS subscription plan, usage quotas, and payment details."
      />

      {/* 1. Active Subscription Hero Card */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 shadow-md">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Zap className="h-32 w-32 text-primary" />
        </div>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">
                  {getPlanDisplayName()}
                </CardTitle>
                <Badge 
                  variant={isActive ? "default" : "secondary"} 
                  className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    isActive 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                      : "bg-primary/20 text-primary border border-primary/30"
                  }`}
                >
                  {isActive ? "Active Subscription" : "🎁 7-Day Free Trial"}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {isActive 
                  ? "Your account is active with full access to all premium CRM automations and features."
                  : "You are currently enjoying full access to Pro Plan features during your 7-Day Free Trial."}
              </CardDescription>
            </div>

            {customerInfo.customerId && (
              <div className="text-right text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1.5 rounded-md border border-border/50">
                Customer ID: {formatSimpleId(customerInfo.customerId)}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* 2. Usage & Quotas */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Resource Quota Usage
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> Messages Sent
                </span>
                <span>245 / 10,000</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "2.45%" }}></div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Resets on the 1st of next month.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Database className="h-3.5 w-3.5 text-emerald-500" /> Contacts Stored
                </span>
                <span>Unlimited</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "15%" }}></div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Unlimited contacts on all plans.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Users className="h-3.5 w-3.5 text-purple-500" /> Agent Seats
                </span>
                <span>Active</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "100%" }}></div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">0% per-user markup fees.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Conversion-Optimized Tier Comparison Grid */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Choose Your Subscription Plan
            </h3>
            <p className="text-sm text-muted-foreground">Select a plan to launch instant recurring billing via Razorpay.</p>
          </div>
        </div>

        {/* Aesthetic Centered Billing Controls Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-gradient-to-r from-card via-muted/50 to-card p-3 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-xl max-w-2xl mx-auto">
          {/* 1. Billing Cycle Segmented Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-foreground/70 uppercase tracking-wider">Cycle:</span>
            <div className="flex bg-background/80 p-1 rounded-xl border border-border/80 shadow-inner">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  !isAnnual
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  isAnnual
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider shadow-sm">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-border/80"></div>

          {/* 2. Currency Selector Segmented Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-foreground/70 uppercase tracking-wider">Currency:</span>
            <div className="flex bg-background/80 p-1 rounded-xl border border-border/80 shadow-inner text-xs">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all duration-200 ${
                  currency === "USD"
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all duration-200 ${
                  currency === "INR"
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ₹ INR
              </button>
            </div>
          </div>
        </div>

        {/* Plan Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {TEST_PLANS.map((plan, idx) => {
            const currentPlanId = plan.planIds[currency];
            const isPlanActive = isActive && (
              (plan.name === "Starter" && planTier === "starter") ||
              (plan.name === "Pro Plan" && planTier === "pro") ||
              (plan.name === "Enterprise" && planTier === "enterprise")
            );
            const isPlanTrial = isTrial && plan.name === "Pro Plan";
            const isCurrent = isPlanActive || isPlanTrial;
            const planPricing = plan.prices[currency];
            const activePrice = isAnnual ? planPricing.yearly : planPricing.monthly;
            const annualTotal = activePrice * 12;

            return (
              <div 
                key={idx}
                className={`relative flex flex-col justify-between rounded-2xl transition-all duration-300 p-6 ${
                  isCurrent
                    ? "pt-8 border-2 border-emerald-500/80 bg-gradient-to-b from-emerald-500/10 via-card to-card shadow-[0_0_35px_rgba(16,185,129,0.2)] md:-translate-y-2 z-10"
                    : plan.popular 
                    ? "pt-8 border-2 border-primary bg-gradient-to-b from-primary/10 via-card to-card shadow-[0_0_35px_rgba(var(--primary),0.2)] md:-translate-y-2 z-10" 
                    : "border border-border/80 bg-card hover:border-border"
                }`}
              >
                {/* Floating Unclipped Badge */}
                {isPlanTrial ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                    <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(16,185,129,0.4)] border border-white/20">
                      🎁 ACTIVE FREE TRIAL
                    </span>
                  </div>
                ) : isPlanActive ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                    <span className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(16,185,129,0.4)] border border-white/20">
                      ✓ CURRENT PLAN
                    </span>
                  </div>
                ) : plan.badge ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                    <span className="rounded-full bg-gradient-to-r from-primary via-blue-500 to-indigo-600 px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(var(--primary),0.4)] border border-white/20">
                      {plan.badge}
                    </span>
                  </div>
                ) : null}

                <div>
                  <div>
                    <h4 className="font-extrabold text-2xl tracking-tight text-foreground">{plan.name}</h4>
                    <p className="text-xs font-semibold text-primary/90 mt-0.5">{plan.tagline}</p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">{symbol}{activePrice}</span>
                      <span className="text-sm font-medium text-muted-foreground">/month</span>
                    </div>
                    {isAnnual ? (
                      <p className="text-[11px] text-emerald-500 font-semibold mt-1">
                        Billed annually ({symbol}{annualTotal.toLocaleString()}/year)
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Billed monthly • Cancel anytime
                      </p>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3 min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="my-6 border-t border-border/60"></div>

                  <ul className="space-y-3 text-xs">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          plan.popular 
                            ? "bg-primary/20 text-primary" 
                            : plan.name === "Starter"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={plan.popular ? "font-semibold text-foreground" : "font-medium text-foreground/90"}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conversion Call-to-Action */}
                <div className="mt-8 pt-4 border-t border-border/40">
                  {isCurrent ? (
                    <div className="w-full text-center py-2.5 px-4 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-inner">
                      <ShieldCheck className="h-4 w-4" /> Current Active Plan
                    </div>
                  ) : (
                    <RazorpayCheckoutButton 
                      planId={currentPlanId}
                      planTier={plan.name.toLowerCase().includes("starter") ? "starter" : plan.name.toLowerCase().includes("pro") ? "pro" : "enterprise"} 
                      label={`Subscribe (${symbol}${activePrice})`}
                      variant={plan.popular ? "default" : "outline"}
                      className={
                        plan.popular
                          ? "w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-extrabold shadow-[0_0_20px_rgba(var(--primary),0.35)] h-11 transition-all hover:scale-[1.02]"
                          : "w-full rounded-xl border-border hover:bg-accent hover:text-accent-foreground h-11"
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Risk Reversal & Trust Banner */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground text-center">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-500" /> Cancel or switch plans anytime
          </span>
          <span>•</span>
          <span>⚡ Instant automated activation</span>
          <span>•</span>
          <span>🔒 256-Bit SSL Encrypted Razorpay Checkout</span>
        </div>

        {/* Collapsible Feature Comparison Accordion */}
        <div className="text-center pt-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card hover:bg-accent border border-border text-xs font-bold text-foreground transition-all hover:scale-105 shadow-sm"
          >
            <span>{showComparison ? "Hide Detailed Feature Breakdown" : "Compare All Features & Capabilities"}</span>
            {showComparison ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
          </button>
        </div>

        {showComparison && (
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl animate-in fade-in-50 duration-300 overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 pb-4 border-b border-border text-xs font-bold">
                <div className="text-muted-foreground">Features & Capabilities</div>
                <div className="text-center text-foreground">Starter</div>
                <div className="text-center text-primary flex items-center justify-center gap-1">
                  Pro Plan <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="text-center text-blue-500">Enterprise</div>
              </div>

              {/* Matrix Categories */}
              {FEATURE_COMPARISON_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="mt-5">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-2 text-left">
                    {cat.category}
                  </h4>
                  <div className="divide-y divide-border/40">
                    {cat.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-4 gap-4 py-3 text-xs items-center hover:bg-muted/30 transition-colors rounded-lg px-2">
                        <div className="text-left font-medium text-foreground/90">{item.name}</div>
                        
                        {/* Starter Value */}
                        <div className="flex justify-center items-center">
                          {typeof item.starter === "boolean" ? (
                            item.starter ? (
                              <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )
                          ) : (
                            <span className="font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/50">{item.starter}</span>
                          )}
                        </div>

                        {/* Pro Value */}
                        <div className="flex justify-center items-center">
                          {typeof item.pro === "boolean" ? (
                            item.pro ? (
                              <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )
                          ) : (
                            <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/30">{item.pro}</span>
                          )}
                        </div>

                        {/* Enterprise Value */}
                        <div className="flex justify-center items-center">
                          {typeof item.enterprise === "boolean" ? (
                            item.enterprise ? (
                              <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )
                          ) : (
                            <span className="font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/30">{item.enterprise}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Invoice & Payment History */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-base font-semibold text-foreground">Billing & Payment History</h3>
        
        <Card className="bg-card/50">
          <CardContent className="p-0">
            <div className="divide-y text-sm">
              <div className="p-4 flex items-center justify-between text-xs text-muted-foreground font-medium bg-muted/30">
                <span>Date</span>
                <span>Plan</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              {isActive ? (
                <div className="p-4 flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{new Date().toLocaleDateString()}</span>
                  <span className="font-semibold text-foreground">Pro Plan Subscription</span>
                  <span className="font-bold">{symbol}{isAnnual ? "15.00" : "19.00"}</span>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                    Paid
                  </Badge>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No billing history found. Completed subscription payments and receipts will appear here automatically.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
