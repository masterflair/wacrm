export type Currency = "USD" | "INR";

export interface PricingPlanConfig {
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

export const PRICING_PLANS: PricingPlanConfig[] = [
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
