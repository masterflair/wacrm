import { XCircle, CheckCircle2, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProblemSection() {
  return (
    <section className="w-full py-32 bg-[#020617] relative border-y border-white/5 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="container mx-auto max-w-6xl px-4 md:px-8 relative z-10">
        <div className="mb-20 text-center">
          <div className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500 mb-6">
            <AlertTriangle className="mr-2 h-4 w-4" />
            The Status Quo
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
            Running a business on <br className="hidden md:block" />
            <span className="text-white/50 line-through decoration-red-500 decoration-4">personal WhatsApp</span> is a nightmare.
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg sm:text-xl">
            Stop losing leads and frustrating your team with shared phones, dropped conversations, and chaotic inboxes.
          </p>
        </div>

        <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto">
          
          {/* VS Badge (Desktop only) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-16 w-16 items-center justify-center rounded-full border-4 border-[#020617] bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
            <span className="text-xl font-black text-white/50 italic">VS</span>
          </div>

          {/* The Problem */}
          <div className="relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 sm:p-10 backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.04]">
            {/* Top red highlight */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            
            <div className="absolute -top-10 -right-10 opacity-5 text-red-500 pointer-events-none">
              <AlertTriangle className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <XCircle className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">The Old Way</h3>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="mt-1 mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-muted-foreground text-lg leading-relaxed">Leads slip through the cracks in a messy, personal inbox.</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-muted-foreground text-lg leading-relaxed">Only one person can reply at a time. Teams can't collaborate.</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-muted-foreground text-lg leading-relaxed">Zero visibility into sales performance or response times.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* The Solution */}
          <div className="group relative rounded-[2rem] border border-primary/30 bg-[#0a0f1e] p-8 sm:p-10 shadow-[0_0_50px_rgba(var(--primary),0.15)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(var(--primary),0.25)] overflow-hidden">
            
            {/* Animated glowing border effect */}
            <div className="absolute inset-0 z-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(var(--primary),0.1)_0deg,transparent_60deg,transparent_300deg,rgba(var(--primary),0.1)_360deg)] opacity-0 group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite] transition-opacity duration-500"></div>
            <div className="absolute inset-[1px] z-0 rounded-[2rem] bg-[#0a0f1e]"></div>
            
            {/* Top primary highlight */}
            <div className="absolute top-0 inset-x-8 z-10 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"></div>
            
            <div className="absolute -bottom-20 -right-20 z-0 h-64 w-64 rounded-full bg-primary/20 blur-[80px] group-hover:bg-primary/30 transition-colors duration-500"></div>

            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 border border-white/20 text-white shadow-[0_0_30px_rgba(var(--primary),0.4)] group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-7 w-7" />
              </div>
              
              <h3 className="text-3xl font-bold mb-8 tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                The RenderAura CRM Way
              </h3>
              
              <ul className="space-y-6">
                <li className="flex items-start group/item">
                  <div className="mt-1 mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 transition-colors group-hover/item:bg-primary/40">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-white/90 text-lg leading-relaxed font-medium">Organized pipelines ensure no lead is ever forgotten.</span>
                </li>
                <li className="flex items-start group/item">
                  <div className="mt-1 mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 transition-colors group-hover/item:bg-primary/40">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-white/90 text-lg leading-relaxed font-medium">Your entire team works from one unified, shared number.</span>
                </li>
                <li className="flex items-start group/item">
                  <div className="mt-1 mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 transition-colors group-hover/item:bg-primary/40">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-white/90 text-lg leading-relaxed font-medium">Crystal-clear analytics on agent performance and revenue.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
