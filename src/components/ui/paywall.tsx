import { Lock, Crown, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaywallProps {
  title: string;
  description: string;
  planName?: "Pro" | "Enterprise";
}

export function Paywall({ title, description, planName = "Pro" }: PaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8 group">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/30 to-purple-600/30 blur-2xl opacity-70 group-hover:opacity-100 transition duration-700"></div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-card shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
          {planName === "Enterprise" ? (
            <Crown className="h-10 w-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          ) : (
            <Zap className="h-10 w-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          )}
          
          <div className="absolute bottom-2 right-2 bg-background rounded-full p-1 border border-border shadow-lg">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-black tracking-tight text-foreground mb-4">
        {title}
      </h2>
      
      <p className="max-w-md text-base text-muted-foreground mb-10 leading-relaxed">
        {description}
      </p>

      <Link href="/settings?tab=billing">
        <Button size="lg" className="rounded-full font-bold px-8 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
          Upgrade to {planName}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      
      <div className="mt-8 text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <Lock className="h-3 w-3" />
        Feature Restricted
      </div>
    </div>
  );
}
