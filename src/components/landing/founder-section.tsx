import Image from "next/image";

export function FounderSection() {
  return (
    <section className="w-full py-24 bg-[#020617] relative border-t border-white/5 overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto max-w-4xl px-4 md:px-8">
        <div className="relative rounded-3xl border border-white/10 bg-[#0a0f1e]/80 p-8 md:p-12 shadow-2xl backdrop-blur-md">
          {/* Decorative quote mark */}
          <div className="absolute -top-6 -left-4 text-7xl text-primary/20 font-serif leading-none select-none pointer-events-none">
            "
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="flex-shrink-0">
              <div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-full border-4 border-white/10 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop&q=80" 
                  alt="Founder" 
                  className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium">
                "I built RenderAura CRM because I was tired of losing massive deals simply because they got buried in my messy personal WhatsApp. This is the tool I wish I had on day one."
              </p>
              <div>
                <h4 className="font-bold text-white text-lg">Rohan</h4>
                <p className="text-muted-foreground">Founder & CEO, RenderAura CRM</p>
              </div>
              
              {/* Fake signature */}
              <div className="pt-2">
                <span className="font-['Brush_Script_MT',cursive] text-3xl text-primary/70 transform -rotate-2 inline-block">
                  Rohan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
