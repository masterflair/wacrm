"use client";

import { useState, useEffect } from "react";
import { Check, Lock, Globe, Sparkles, ChevronDown, ChevronUp, X } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/billing/RazorpayCheckoutButton";

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

interface PricingPlanConfig {
  key: "starter" | "pro" | "enterprise";
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

const PRICING_PLANS: PricingPlanConfig[] = [
  {
    key: "starter",
    planIds: {
      USD: "plan_TGlmOwr6WFViTm",
      INR: "plan_TGm2jZqWasg4gv"
    },
    name: "Starter",
    tagline: "⚡ Best Value for Solo Sellers & Fast Launch",
    description: "Launch your official WhatsApp CRM in minutes with zero setup friction.",
    popular: false,
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
    key: "pro",
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
    key: "enterprise",
    planIds: {
      USD: "plan_TGlowI487XtXtu",
      INR: "plan_TGm2l5UsC0DXUT"
    },
    name: "Enterprise",
    tagline: "For Multi-Brand Corporate Scale & Integration",
    description: "Multi-number WhatsApp suite, custom-trained AI, developer APIs, and dedicated SLA.",
    popular: false,
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

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [autoDetected, setAutoDetected] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Auto-detect visitor's country / currency via Timezone & Browser Locales
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const langs = navigator.languages || [navigator.language || ""];
      
      const isIndia = tz.includes("Kolkata") || tz.includes("Calcutta") || langs.some(l => l.toLowerCase().includes("in"));
      if (isIndia) {
        setCurrency("INR");
      } else {
        setCurrency("USD");
      }
      setAutoDetected(true);
    } catch (e) {
      setCurrency("USD");
    }
  }, []);

  const symbol = currency === "INR" ? "₹" : "$";

  return (
    <section className="w-full py-24 bg-[#03081a] relative border-y border-white/5" id="pricing">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] mask-image:linear-gradient(to_bottom,white,transparent)"></div>
      <div className="container mx-auto max-w-6xl px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Transparent Pricing • Zero Seat Fees
          </div>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
            Simple Pricing, Unlimited Scale
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose a plan below to launch instant recurring subscription billing.
          </p>

          {/* Controls Container: Centered Aesthetic Segmented Tabs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 bg-gradient-to-r from-[#0a0f1e] via-[#111827] to-[#0a0f1e] p-3 rounded-2xl border border-primary/30 shadow-[0_0_35px_rgba(var(--primary),0.2)] backdrop-blur-xl max-w-2xl mx-auto">
            {/* 1. Monthly / Yearly Billing Segmented Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-white/70 uppercase tracking-wider">Cycle:</span>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    !isAnnual
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isAnnual
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Yearly
                  <span className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider shadow-sm">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-white/10"></div>

            {/* 2. Currency Switcher ($ USD / ₹ INR) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-white/70 uppercase tracking-wider">Currency:</span>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs shadow-inner">
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all duration-200 ${
                    currency === "USD"
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all duration-200 ${
                    currency === "INR"
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  ₹ INR
                </button>
              </div>
            </div>
          </div>

          {autoDetected && (
            <p className="mt-3 text-[11px] text-muted-foreground/70">
              Auto-detected region: <strong className="text-white">{currency} ({symbol})</strong>
            </p>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-4">
          {PRICING_PLANS.map((plan) => {
            const planPricing = plan.prices[currency];
            const activePrice = isAnnual ? planPricing.yearly : planPricing.monthly;
            const annualTotal = activePrice * 12;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col justify-between rounded-3xl p-8 backdrop-blur-md transition-all duration-300 ${
                  plan.popular
                    ? "pt-9 border-2 border-primary bg-[#0a0f1e] shadow-[0_0_50px_rgba(var(--primary),0.25)] md:-translate-y-4 z-10"
                    : "border border-white/10 bg-[#0a0f1e]/80"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                    <span className="rounded-full bg-gradient-to-r from-primary via-blue-500 to-indigo-600 px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(var(--primary),0.4)] border border-white/20">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-6">
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-white">{plan.name}</h3>
                      <p className="text-xs font-semibold text-primary/90 mt-0.5">{plan.tagline}</p>
                    </div>
                    <p className="text-muted-foreground text-xs mt-2 h-10">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-white">
                        {symbol}{activePrice}
                      </span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    {isAnnual ? (
                      <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                        Billed annually ({symbol}{annualTotal.toLocaleString()}/year)
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Billed monthly • Cancel anytime
                      </p>
                    )}
                  </div>

                  <ul className="mb-8 space-y-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          plan.popular 
                            ? "bg-primary/20 text-primary" 
                            : plan.key === "starter"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={plan.popular ? "text-white font-semibold text-sm" : "text-white/90 font-medium text-sm"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <RazorpayCheckoutButton 
                    planId={plan.planIds[currency]}
                    planTier={plan.key}
                    label={`Subscribe for ${symbol}${activePrice}`}
                    variant={plan.popular ? "default" : "outline"}
                    className={
                      plan.popular
                        ? "w-full rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-extrabold shadow-[0_0_25px_rgba(var(--primary),0.4)] h-12 text-md transition-all hover:scale-[1.02]"
                        : "w-full rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-12"
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Reversal Banner */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 py-4 px-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-muted-foreground text-center">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-400" /> Cancel anytime with zero penalty
          </span>
          <span>•</span>
          <span>⚡ Automated Instant Activation</span>
          <span>•</span>
          <span>🔒 256-Bit SSL Encrypted Razorpay Gateway</span>
        </div>

        {/* Collapsible Feature Comparison Accordion */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all hover:scale-105 shadow-lg"
          >
            <span>{showComparison ? "Hide Detailed Feature Breakdown" : "Compare All Features & Capabilities"}</span>
            {showComparison ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />}
          </button>
        </div>

        {showComparison && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#0a0f1e]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl animate-in fade-in-50 duration-300 overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 pb-4 border-b border-white/10 text-sm font-bold">
                <div className="text-muted-foreground">Features & Capabilities</div>
                <div className="text-center text-white">Starter</div>
                <div className="text-center text-primary flex items-center justify-center gap-1">
                  Pro Plan <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="text-center text-blue-400">Enterprise</div>
              </div>

              {/* Matrix Categories */}
              {FEATURE_COMPARISON_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="mt-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-primary/80 mb-3 text-left">
                    {cat.category}
                  </h4>
                  <div className="divide-y divide-white/5">
                    {cat.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-4 gap-4 py-3.5 text-xs items-center hover:bg-white/[0.02] transition-colors rounded-lg px-2">
                        <div className="text-left font-medium text-white/90">{item.name}</div>
                        
                        {/* Starter Value */}
                        <div className="flex justify-center items-center">
                          {typeof item.starter === "boolean" ? (
                            item.starter ? (
                              <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400/60 flex items-center justify-center">
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )
                          ) : (
                            <span className="font-semibold text-white/80 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">{item.starter}</span>
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
                              <div className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400/60 flex items-center justify-center">
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
                              <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400/60 flex items-center justify-center">
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )
                          ) : (
                            <span className="font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/30">{item.enterprise}</span>
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
    </section>
  );
}
