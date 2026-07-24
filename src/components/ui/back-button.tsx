"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  );
}
