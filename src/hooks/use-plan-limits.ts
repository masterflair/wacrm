import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { PlanLimits } from "@/lib/plan-limits";
import { getPlanLimits } from "@/lib/plan-limits";
import type { PlanTier } from "@/lib/plan-limits";

export function usePlanLimits() {
  const { accountId } = useAuth();
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLimits() {
      if (!accountId) {
        setIsLoading(false);
        return;
      }
      
      const supabase = createClient();
      const { data, error } = await supabase
        .rpc("get_account_plan_limits", { target_account_id: accountId });

      if (data && data.length > 0) {
        // We can just rely on getPlanLimits to handle the client-side mappings
        const tier = (data[0].plan_tier as PlanTier) || "starter";
        const clientLimits = getPlanLimits(tier);
        setLimits(clientLimits);
      } else {
        setLimits(getPlanLimits("starter"));
      }
      setIsLoading(false);
    }
    
    fetchLimits();
  }, [accountId]);

  return { limits, isLoading };
}
