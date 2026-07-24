import { Star } from "lucide-react";
import Image from "next/image";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Before RenderAura CRM, tracking user feedback over WhatsApp was chaotic. Now, with the visual Kanban pipelines, our product team can categorize and respond to requests 3x faster without leaving the dashboard.",
      name: "Jori Lallo",
      role: "Co-founder, Linear",
      image: "https://i.pravatar.cc/150?u=linear1"
    },
    {
      quote: "We use RenderAura CRM's automations to handle our initial onboarding flow. The delivery rates are 100%, and the AI auto-replies have completely eliminated the need for a separate level-1 support team.",
      name: "Thomas Paul Mann",
      role: "Co-founder, Raycast",
      image: "https://i.pravatar.cc/150?u=raycast1"
    },
    {
      quote: "Managing enterprise support over WhatsApp used to require 3 separate tools. RenderAura CRM brought it all into one highly-secure shared inbox, dropping our SLA resolution time by an incredible 45%.",
      name: "Paul Copplestone",
      role: "CEO, Supabase",
      image: "https://i.pravatar.cc/150?u=supabase1"
    }
  ];

  return (
    <section className="w-full py-24 bg-[#020617] relative border-t border-white/5">
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
            Loved by sales leaders
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Don't just take our word for it. Here's what our customers have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0a0f1e]/80 p-8 shadow-xl backdrop-blur-md transition-transform hover:-translate-y-2">
              <div>
                <div className="flex gap-1 mb-6 text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-lg text-white/90 leading-relaxed mb-8">
                  "{t.quote}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.image} alt={t.name} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
