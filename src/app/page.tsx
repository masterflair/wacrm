import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ArrowRight, Lock, Zap, Users, Workflow, BarChart3, CheckCircle2, Sparkles, Globe, Shield, Check, ChevronDown, LayoutDashboard, Radio, GitMerge, Bot, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { ProblemSection } from "@/components/landing/problem-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { TestimonialsSection } from "@/components/landing/testimonial-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FounderSection } from "@/components/landing/founder-section";
import { SecuritySection } from "@/components/landing/security-section";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto bg-[#020617] text-foreground selection:bg-primary/30">
      <SmoothScroll />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020617]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[#020617]/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <WhatsAppIcon className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RenderAura CRM</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
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
        {/* Hero Section with 3D Elements */}
        <section className="relative w-full px-4 pt-24 pb-20 md:pt-32 md:pb-32" style={{ perspective: '2000px' }}>
          {/* 3D Background Orbs */}
          <div className="absolute top-1/4 left-1/4 -z-10 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/20 blur-[120px] mix-blend-screen" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] animate-pulse rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>

          <div className="container mx-auto max-w-6xl text-center relative z-10">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="mx-auto mb-8 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-md shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                WhatsApp Business CRM 2.0 is here
              </div>
              <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-2xl text-white">
                Supercharge your <br className="hidden md:block" />
                <span className="bg-gradient-to-br from-primary via-blue-400 to-purple-600 bg-clip-text text-transparent">
                  WhatsApp Sales
                </span>
              </h1>
              <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                The ultimate shared inbox, CRM, and automation platform for modern teams using WhatsApp. Convert more leads, support customers faster, and automate your workflows.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="h-14 rounded-full px-8 text-base transition-all duration-300 hover:shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:scale-105 bg-gradient-to-r from-primary to-blue-600 border-0 text-white font-semibold">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="h-14 rounded-full px-8 text-base border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white transition-colors">
                    See How it Works
                  </Button>
                </Link>
              </div>
              <p className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
                <Lock className="mr-1.5 h-4 w-4 opacity-70" /> Setup takes 2 minutes. No credit card required.
              </p>
            </div>
            
            {/* 3D Isometric Dashboard Preview */}
            <div className="mx-auto mt-24 max-w-5xl animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 fill-mode-both" style={{ perspective: '2000px' }}>
              <div className="relative group transition-all duration-700 ease-out hover:rotate-0 hover:scale-100" 
                   style={{ transform: "rotateX(12deg) rotateY(-8deg) rotateZ(3deg) scale(0.96)", transformStyle: 'preserve-3d' }}>
                
                {/* 3D Floating Elements */}
                <div className="absolute -left-4 -top-6 md:-left-8 md:-top-8 z-20 h-14 w-14 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-[1px] shadow-2xl transition-transform duration-500 group-hover:translate-y-[-10px] animate-bounce" style={{ transform: 'translateZ(50px)', animationDuration: '4s' }}>
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#020617]/90 backdrop-blur-xl">
                    <Globe className="h-6 w-6 md:h-8 md:w-8 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                  </div>
                </div>

                <div className="absolute -right-4 bottom-8 md:-right-6 md:bottom-16 z-20 h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-[1px] shadow-2xl transition-transform duration-500 group-hover:translate-y-[10px] animate-bounce" style={{ transform: 'translateZ(80px)', animationDuration: '5s', animationDelay: '1s' }}>
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#020617]/90 backdrop-blur-xl">
                    <WhatsAppIcon className="h-5 w-5 md:h-6 md:w-6 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  </div>
                </div>

                {/* Main Dashboard Card (3D Base) */}
                <div className="relative rounded-2xl border border-white/10 bg-[#0a0f1e] p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-3 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-b before:from-primary/10 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity">
                  <div className="absolute -top-10 right-20 -z-10 h-40 w-40 rounded-full bg-primary/40 blur-[80px]"></div>
                  <div className="absolute -bottom-10 -left-10 -z-10 h-40 w-40 rounded-full bg-blue-500/30 blur-[80px]"></div>
                  
                  {/* Interactive App Demo */}
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 shadow-inner group-hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] transition-shadow">
                    <InteractiveDemo />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Trusted By */}
        <section className="w-full py-12 border-y border-white/5 bg-[#03081a]">
          <div className="container mx-auto max-w-6xl px-4 text-center">
            <div className="pt-8 mt-8 border-t border-white/5">
              <p className="text-sm font-medium text-white/40 tracking-widest uppercase mb-6">Trusted by innovative teams worldwide</p>
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 items-center">
                {/* Linear */}
                <div className="flex items-center gap-2 font-bold text-xl text-white hover:text-white transition-colors cursor-pointer group">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor"><path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z"/></svg>
                  <span>Linear</span>
                </div>
                {/* Raycast */}
                <div className="flex items-center gap-2 font-bold text-xl text-white hover:text-[#FF6363] transition-colors cursor-pointer group">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor"><path d="M6.004 15.492v2.504L0 11.992l1.258-1.249Zm2.504 2.504H6.004L12.008 24l1.253-1.253zm14.24-4.747L24 11.997 12.003 0 10.75 1.251 15.491 6h-2.865L9.317 2.692 8.065 3.944l2.06 2.06H8.691v9.31H18v-1.432l2.06 2.06 1.252-1.252-3.312-3.32V8.506ZM6.63 5.372 5.38 6.625l1.342 1.343 1.251-1.253Zm10.655 10.655-1.247 1.251 1.342 1.343 1.253-1.251zM3.944 8.059 2.692 9.31l3.312 3.314v-2.506zm9.936 9.937h-2.504l3.314 3.312 1.25-1.252z"/></svg>
                  <span>Raycast</span>
                </div>
                {/* Supabase */}
                <div className="flex items-center gap-2 font-bold text-xl text-white hover:text-[#3ECF8E] transition-colors cursor-pointer group">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor"><path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z"/></svg>
                  <span>Supabase</span>
                </div>
                {/* Resend */}
                <div className="flex items-center gap-2 font-bold text-xl text-white hover:text-[#ffffff] transition-colors cursor-pointer group">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor"><path d="M14.679 0c4.648 0 7.413 2.765 7.413 6.434s-2.765 6.434-7.413 6.434H12.33L24 24h-8.245l-8.88-8.44c-.636-.588-.93-1.273-.93-1.86 0-.831.587-1.565 1.713-1.883l4.574-1.224c1.737-.465 2.936-1.81 2.936-3.572 0-2.153-1.761-3.4-3.939-3.4H0V0z"/></svg>
                  <span>Resend</span>
                </div>
                {/* Cal.com */}
                <div className="flex items-center gap-2 font-bold text-xl text-white hover:text-[#292929] transition-colors cursor-pointer group">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor"><path d="M2.408 14.488C1.035 14.488 0 13.4 0 12.058c0-1.346.982-2.443 2.408-2.443.758 0 1.282.233 1.691.765l-.66.55a1.343 1.343 0 0 0-1.03-.442c-.93 0-1.44.711-1.44 1.57 0 .86.559 1.557 1.44 1.557.413 0 .765-.147 1.043-.443l.651.573c-.391.51-.929.743-1.695.743zM6.948 10.913h.89v3.49h-.89v-.51c-.185.362-.493.604-1.083.604-.943 0-1.695-.82-1.695-1.826 0-1.007.752-1.825 1.695-1.825.585 0 .898.241 1.083.604zm.026 1.758c0-.546-.374-.998-.964-.998-.568 0-.938.457-.938.998 0 .528.37.998.938.998.586 0 .964-.456.964-.998zM8.467 9.503h.89v4.895h-.89zM9.752 13.937a.53.53 0 0 1 .542-.528c.313 0 .533.242.533.528a.527.527 0 0 1-.533.537.534.534 0 0 1-.542-.537zM14.23 13.839c-.33.403-.832.658-1.426.658a1.806 1.806 0 0 1-1.84-1.826c0-1.007.778-1.825 1.84-1.825.572 0 1.07.241 1.4.622l-.687.577c-.172-.215-.396-.376-.713-.376-.568 0-.938.456-.938.998 0 .541.37.997.938.997.343 0 .58-.179.757-.42zM14.305 12.671c0-1.007.78-1.825 1.84-1.825 1.061 0 1.84.818 1.84 1.825 0 1.007-.779 1.826-1.84 1.826-1.06-.005-1.84-.82-1.84-1.826zm2.778 0c0-.546-.37-.998-.938-.998-.568-.004-.937.452-.937.998 0 .542.37.998.937.998.568 0 .938-.456.938-.998zM24 12.269v2.13h-.89v-1.911c0-.604-.281-.864-.704-.864-.396 0-.678.197-.678.864v1.91h-.89v-1.91c0-.604-.285-.864-.704-.864-.396 0-.744.197-.744.864v1.91h-.89v-3.49h.89v.484c.185-.376.52-.564 1.035-.564.489 0 .898.241 1.123.649.224-.417.554-.65 1.153-.65.731.005 1.299.56 1.299 1.442z"/></svg>
                  <span>Cal.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>

                {/* Problem Section */}
        <ProblemSection />

{/* Advanced Features Section with Hover Effects */}
        <section id="features" className="w-full py-24 bg-[#03081a] border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          
          <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white">Advanced capabilities</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg">Engineered for performance and scale. Everything you need to automate your sales funnel.</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AdvancedFeatureCard 
                icon={<LayoutDashboard className="h-6 w-6 text-blue-400" />}
                title="Live Analytics Dashboard"
                description="Monitor team performance, response times, and pipeline revenue in real-time."
                color="from-blue-500/20 to-blue-600/5"
                borderColor="group-hover:border-blue-500/50"
              />
              <AdvancedFeatureCard 
                icon={<WhatsAppIcon className="h-6 w-6 text-emerald-400" />}
                title="Unified Shared Inbox"
                description="Bring your whole team into a single WhatsApp number. Assign chats and collaborate instantly."
                color="from-emerald-500/20 to-emerald-600/5"
                borderColor="group-hover:border-emerald-500/50"
              />
              <AdvancedFeatureCard 
                icon={<Users className="h-6 w-6 text-purple-400" />}
                title="Smart Contact Management"
                description="Segment your audience, track interactions, and manage custom attributes seamlessly."
                color="from-purple-500/20 to-purple-600/5"
                borderColor="group-hover:border-purple-500/50"
              />
              <AdvancedFeatureCard 
                icon={<Workflow className="h-6 w-6 text-green-400" />}
                title="Visual Kanban Pipelines"
                description="Track deals and leads through customizable drag-and-drop boards to boost conversions."
                color="from-green-500/20 to-green-600/5"
                borderColor="group-hover:border-green-500/50"
              />
              <AdvancedFeatureCard 
                icon={<Radio className="h-6 w-6 text-pink-400" />}
                title="Targeted Broadcasts"
                description="Send bulk WhatsApp campaigns to dynamic segments with pre-approved templates."
                color="from-pink-500/20 to-pink-600/5"
                borderColor="group-hover:border-pink-500/50"
              />
              <AdvancedFeatureCard 
                icon={<FileText className="h-6 w-6 text-emerald-400" />}
                title="WhatsApp Quotations & GST Invoicing"
                description="Generate PDF estimates with automatic GST calculations and send them directly over WhatsApp in 1-click."
                color="from-emerald-500/20 to-emerald-600/5"
                borderColor="group-hover:border-emerald-500/50"
              />
              <AdvancedFeatureCard 
                icon={<Zap className="h-6 w-6 text-orange-400" />}
                title="No-Code Automations"
                description="Build powerful multi-step workflows to auto-reply, assign conversations, and qualify leads."
                color="from-orange-500/20 to-orange-600/5"
                borderColor="group-hover:border-orange-500/50"
              />
              <AdvancedFeatureCard 
                icon={<GitMerge className="h-6 w-6 text-yellow-400" />}
                title="Visual Flow Builder"
                description="Design intricate chat routing and conversational menus with an intuitive drag-and-drop canvas."
                color="from-yellow-500/20 to-yellow-600/5"
                borderColor="group-hover:border-yellow-500/50"
              />
              <AdvancedFeatureCard 
                icon={<Bot className="h-6 w-6 text-indigo-400" />}
                title="Autonomous AI Agents"
                description="Deploy intelligent AI copilots that understand your business and handle level-1 support 24/7."
                color="from-indigo-500/20 to-indigo-600/5"
                borderColor="group-hover:border-indigo-500/50"
              />
              <AdvancedFeatureCard 
                icon={<Shield className="h-6 w-6 text-slate-400" />}
                title="Enterprise Security"
                description="Row-level security, end-to-end encryption, and granular role-based access control."
                color="from-slate-500/20 to-slate-600/5"
                borderColor="group-hover:border-slate-500/50"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-24 bg-[#020617] relative">
          <div className="container mx-auto max-w-6xl px-4 md:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">How it works</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg">Get your entire sales and support team on WhatsApp in minutes.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

              <div className="relative text-center z-10 flex flex-col items-center">
                <div className="h-24 w-24 rounded-2xl bg-[#0a0f1e] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative">
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-3xl blur-xl -z-10"></div>
                  <Globe className="h-10 w-10 text-blue-400" />
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold border-4 border-[#020617]">1</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Connect WhatsApp API</h3>
                <p className="text-muted-foreground">Scan a QR code or securely link your Meta Business account to bring your official number online.</p>
              </div>

              <div className="relative text-center z-10 flex flex-col items-center">
                <div className="h-24 w-24 rounded-2xl bg-[#0a0f1e] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative">
                  <div className="absolute -inset-2 bg-purple-500/20 rounded-3xl blur-xl -z-10"></div>
                  <Users className="h-10 w-10 text-purple-400" />
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold border-4 border-[#020617]">2</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Invite Your Team</h3>
                <p className="text-muted-foreground">Add agents, assign roles, and set up your shared inbox so no customer query goes unanswered.</p>
              </div>

              <div className="relative text-center z-10 flex flex-col items-center">
                <div className="h-24 w-24 rounded-2xl bg-[#0a0f1e] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative">
                  <div className="absolute -inset-2 bg-green-500/20 rounded-3xl blur-xl -z-10"></div>
                  <Zap className="h-10 w-10 text-green-400" />
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold border-4 border-[#020617]">3</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Automate & Scale</h3>
                <p className="text-muted-foreground">Build visual pipelines, set up AI auto-replies, and send bulk broadcasts to convert leads instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

                {/* Comparison Section */}
        <ComparisonSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Founder Note Section */}
        <FounderSection />

        {/* Security Section */}
        <SecuritySection />

        {/* Interactive FAQ Section */}
        <FaqSection />

        {/* CTA Section */}
        <section className="w-full py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#020617]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
            <h2 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl text-white">Ready to transform your sales?</h2>
            <p className="mb-10 text-xl text-muted-foreground max-w-2xl mx-auto">Join hundreds of forward-thinking companies using RenderAura CRM to close deals faster on WhatsApp.</p>
            <Link href="/signup">
              <Button size="lg" className="h-16 rounded-full px-12 text-lg shadow-[0_0_40px_rgba(var(--primary),0.4)] transition-all hover:scale-110 hover:shadow-[0_0_60px_rgba(var(--primary),0.6)] active:scale-95 bg-white text-black hover:bg-white/90 font-semibold">
                Get Started for Free
              </Button>
            </Link>
            <p className="mt-8 text-sm text-muted-foreground/60">No credit card required. 14-day free trial.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}



export function AdvancedFeatureCard({ icon, title, description, color, borderColor }: { icon: React.ReactNode, title: string, description: string, color: string, borderColor: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0f1e]/50 p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-[#0a0f1e] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${borderColor}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}></div>
      <div className="absolute top-0 inset-x-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      <div className="relative z-10">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  )
}

