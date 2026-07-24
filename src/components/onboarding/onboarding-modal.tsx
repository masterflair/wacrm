"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Workflow, Bot, FileText, ChevronRight, ChevronLeft, LayoutDashboard, CheckCircle2, Users, Radio } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const FEATURES = [
  {
    id: "welcome",
    title: "Welcome to RenderAura CRM!",
    description: "Let's take a quick tour of the powerful tools you now have at your fingertips.",
    icon: CheckCircle2,
  },
  {
    id: "inbox",
    title: "Shared Team Inbox",
    description: "Collaborate with your team to reply to customers in real-time, all from one dashboard.",
    icon: MessageSquare,
  },
  {
    id: "contacts",
    title: "Contact Management",
    description: "Sync, tag, and organize all your WhatsApp contacts instantly into rich profiles.",
    icon: Users,
  },
  {
    id: "pipelines",
    title: "Kanban Pipelines",
    description: "Track leads and deals across multiple drag-and-drop stages. Never lose a sale again.",
    icon: LayoutDashboard,
  },
  {
    id: "broadcasts",
    title: "Bulk Broadcasts",
    description: "Send personalized, targeted WhatsApp campaigns to thousands of customers in one click.",
    icon: Radio,
  },
  {
    id: "automations",
    title: "No-Code Automations",
    description: "Build visual workflows for auto-replies, drip campaigns, and automatic lead tagging.",
    icon: Workflow,
  },
  {
    id: "ai",
    title: "AI Copilot",
    description: "Let your AI Agent draft responses instantly, trained exclusively on your custom knowledge base.",
    icon: Bot,
  },
  {
    id: "quotations",
    title: "Quotations & Invoicing",
    description: "Generate professional PDFs, send them via WhatsApp, and track approvals seamlessly.",
    icon: FileText,
  },
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire an EPIC celebration party explosion matching the brand theme!
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 40, spread: 360, ticks: 120, zIndex: 10000 };
      
      // Violet/Purple/Pink/Blue brand theme colors
      const brandColors = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#3b82f6', '#6366f1'];

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 70 * (timeLeft / duration);
        
        // Continuous Side Cannons
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: brandColors,
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: brandColors,
        });

        // Massive bottom-up mortar fireworks (40% chance per tick)
        if (Math.random() < 0.4) {
          confetti({
            ...defaults,
            particleCount: 150,
            spread: 120,
            startVelocity: 80,
            origin: { x: 0.5, y: 1 },
            colors: brandColors
          });
        }
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // If closed or already done, do nothing
  if (!isOpen) return null;

  const feature = FEATURES[currentStep];
  const isLastStep = currentStep === FEATURES.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (!user) return;
    setLoading(true);

    try {
      localStorage.setItem(`wacrm_onboarding_${user.id}`, "completed");
      toast.success("Welcome aboard! Let's get started.");
      onComplete();
    } catch (err: any) {
      console.error("Onboarding error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden" showCloseButton={false}>
        <div className="bg-primary/5 p-10 text-center pb-8 flex flex-col items-center justify-center min-h-[260px] relative">
          
          {/* Subtle background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -right-[20%] w-[150%] h-[150%] rounded-full bg-primary/5 blur-3xl opacity-50" />
            <div className="absolute -bottom-[50%] -left-[20%] w-[150%] h-[150%] rounded-full bg-primary/5 blur-3xl opacity-50" />
          </div>

          <div className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <feature.icon className="h-10 w-10 animate-in zoom-in duration-300" key={feature.id} />
          </div>
          
          <DialogHeader className="relative z-10 w-full px-4">
            <DialogTitle className="text-2xl font-bold text-center animate-in slide-in-from-bottom-2 fade-in duration-300" key={`title-${feature.id}`}>
              {feature.title}
            </DialogTitle>
            <DialogDescription className="text-center text-base mt-3 animate-in slide-in-from-bottom-3 fade-in duration-500 h-14" key={`desc-${feature.id}`}>
              {feature.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-card border-t flex flex-col shadow-inner">
          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {FEATURES.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  index === currentStep 
                    ? "w-10 bg-primary" 
                    : index < currentStep 
                      ? "w-4 bg-primary/30" 
                      : "w-2 bg-secondary"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 0 || loading}
              className={`transition-opacity ${currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={loading} 
              className="min-w-[130px] font-semibold"
              size={isLastStep ? "lg" : "default"}
            >
              {loading ? "Saving..." : isLastStep ? "Get Started" : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
