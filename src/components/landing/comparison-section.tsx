import { Check, X } from "lucide-react";

export function ComparisonSection() {
  const features = [
    { name: "0% Markup on Meta Message Fees", renderAura: true, wati: false, aisensy: false },
    { name: "Unlimited Agent Seats Included", renderAura: true, wati: false, aisensy: false },
    { name: "Free Built-in AI Chatbot Flow", renderAura: true, wati: false, aisensy: false },
    { name: "Native Visual CRM Kanban Board", renderAura: true, wati: false, aisensy: false },
    { name: "Official WhatsApp Business API", renderAura: true, wati: true, aisensy: true },
    { name: "Multi-Agent Shared Inbox", renderAura: true, wati: true, aisensy: true },
  ];

  return (
    <section className="w-full py-24 bg-[#03081a] relative border-t border-white/5">
      <div className="container mx-auto max-w-5xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
            Why RenderAura CRM wins
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            See how we stack up against the alternatives.
          </p>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="min-w-[700px] rounded-3xl border border-white/10 bg-[#0a0f1e]/50 overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="grid grid-cols-4 bg-[#020617] border-b border-white/10 p-6 text-sm font-bold text-white uppercase tracking-wider">
              <div className="col-span-1 flex items-center">Features</div>
              <div className="col-span-1 flex items-center justify-center text-primary text-base">RenderAura CRM</div>
              <div className="col-span-1 flex items-center justify-center text-muted-foreground">Wati</div>
              <div className="col-span-1 flex items-center justify-center text-muted-foreground">AiSensy</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-white/5">
              {features.map((feature, i) => (
                <div key={i} className="grid grid-cols-4 p-6 transition-colors hover:bg-white/[0.02]">
                  <div className="col-span-1 flex items-center font-medium text-white">
                    {feature.name}
                  </div>
                  
                  {/* RenderAura CRM Column */}
                  <div className="col-span-1 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-xl -my-3"></div>
                    <Check className="h-6 w-6 text-primary relative z-10" />
                  </div>
                  
                  {/* Wati Column */}
                  <div className="col-span-1 flex items-center justify-center">
                    {feature.wati ? (
                      <Check className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <X className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  
                  {/* AiSensy Column */}
                  <div className="col-span-1 flex items-center justify-center">
                    {feature.aisensy ? (
                      <Check className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <X className="h-5 w-5 text-white/20" />
                    )}
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
