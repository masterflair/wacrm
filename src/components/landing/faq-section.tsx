"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Can I upgrade, downgrade, or cancel my subscription at any time?",
    answer: "Yes, absolutely! You can upgrade or switch your plan anytime directly from your account settings. Upgrades take effect immediately, and you can cancel anytime with zero cancellation fees."
  },
  {
    question: "Do I need an official WhatsApp Business API account?",
    answer: "Yes, RenderAura CRM connects directly to the official Meta WhatsApp Business API. If you don't have one yet, our 2-minute onboarding flow will guide you through connecting your Meta Business Manager."
  },
  {
    question: "How does WhatsApp Meta API message billing work?",
    answer: "RenderAura CRM charges a simple flat subscription fee for the CRM platform. Meta charges per-conversation fees directly to your Meta billing account. Note that Meta provides 1,000 free service conversations per month for every WABA account."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We process payments securely via Razorpay. We accept all major Credit Cards, Debit Cards, Net Banking, and UPI Autopay for seamless recurring billing."
  },
  {
    question: "Is there any setup fee or hidden cost?",
    answer: "No! There are zero hidden setup fees, zero per-agent seat markups, and zero hidden maintenance costs. What you see on the pricing page is exactly what you pay."
  },
  {
    question: "What happens if I exceed my monthly message limit?",
    answer: "We'll notify you when you reach 80% and 100% of your plan limit. Your service will never be interrupted abruptly; you can easily upgrade to the next tier with 1 click."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-24 bg-[#03081a] relative border-t border-white/5">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none"></div>
      
      <div className="container mx-auto max-w-4xl px-4 md:px-8 relative z-10">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <HelpCircle className="h-3.5 w-3.5" /> Got Questions?
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground text-base max-w-xl mx-auto">
            Everything you need to know about our plans, billing, and WhatsApp Business API integration.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-primary/40 bg-[#0a0f1e] shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                    : "border-white/10 bg-[#0a0f1e]/40 hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-lg font-bold text-white leading-snug">
                    {faq.question}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                  }`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-white/5 pt-4 animate-in fade-in-50 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
