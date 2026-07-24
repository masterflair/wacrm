import { Shield, Lock, Server, CheckCircle2 } from "lucide-react";

export function SecuritySection() {
  const securityFeatures = [
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "End-to-End Encryption",
      description: "Your messages are encrypted at rest and in transit. Not even we can read them."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Official Meta Partner",
      description: "We use the official WhatsApp Cloud API. No ban risks, no sketchy workarounds."
    },
    {
      icon: <Server className="h-6 w-6 text-primary" />,
      title: "GDPR & SOC2 Ready",
      description: "Enterprise-grade data infrastructure built to comply with strict global privacy laws."
    }
  ];

  return (
    <section className="w-full py-24 bg-[#03081a] relative border-t border-white/5">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400 mb-2">
              <Shield className="mr-2 h-4 w-4" />
              Enterprise Security
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Your customer data is strictly yours.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              We know how sensitive customer conversations are. That's why RenderAura CRM is built on an enterprise-grade security foundation, guaranteeing that your data is never sold, scraped, or compromised.
            </p>
            
            <ul className="space-y-4 pt-4 text-left inline-block lg:block">
              <li className="flex items-center text-white/90">
                <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                Data stays in secure AWS regions
              </li>
              <li className="flex items-center text-white/90">
                <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                Strict Role-Based Access Controls (RBAC)
              </li>
              <li className="flex items-center text-white/90">
                <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                Regular third-party penetration testing
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="grid gap-4">
              {securityFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[#0a0f1e]/80 p-6 shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-1 hover:border-primary/30">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
