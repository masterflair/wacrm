import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Pricing & Plans — RenderAura CRM",
  description: "Simple, transparent pricing for RenderAura WhatsApp CRM. Scale your sales, support, and AI automations with zero per-agent markup fees.",
};

export default function PricingPage() {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto bg-[#020617] text-foreground selection:bg-primary/30">
      <SmoothScroll />
      
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020617]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[#020617]/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <WhatsAppIcon className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RenderAura CRM</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="/pricing" className="text-white font-semibold transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground transition-colors hover:text-white">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-6 transition-all hover:scale-105 active:scale-95 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex min-h-screen flex-col items-center">
        {/* Production SaaS Hero Header */}
        <section className="w-full pt-20 pb-6 px-4 text-center">
          <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <Sparkles className="mr-2 h-3.5 w-3.5 animate-pulse" />
            Transparent Pricing • Zero Seat Fees
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-md">
            Simple, Transparent Pricing <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              for Every Stage of Growth
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Supercharge your WhatsApp sales with automated AI support, visual Kanban pipelines, and shared team inboxes. Enjoy 0% markup on Meta fees.
          </p>
        </section>

        {/* Pricing Component */}
        <PricingSection />

        {/* Interactive FAQ Accordion */}
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
