export type PlanTier = "starter" | "pro" | "enterprise";

export interface PlanLimits {
  tier: PlanTier;
  includedSeats: number;
  extraSeatPriceUSD: number;
  extraSeatPriceINR: number;
  maxMessagesMonthly: number;
  hasAiCopilot: boolean;
  hasAutoReplyBot: boolean;
  hasKanbanPipeline: boolean;
  hasDeveloperApi: boolean;
  hasCustomAiTraining: boolean;
  hasMultiWaba: boolean;
}

export const PLAN_LIMITS_MAP: Record<PlanTier, PlanLimits> = {
  starter: {
    tier: "starter",
    includedSeats: 3,
    extraSeatPriceUSD: 5,
    extraSeatPriceINR: 399,
    maxMessagesMonthly: 10000,
    hasAiCopilot: false,
    hasAutoReplyBot: false,
    hasKanbanPipeline: false,
    hasDeveloperApi: false,
    hasCustomAiTraining: false,
    hasMultiWaba: false,
  },
  pro: {
    tier: "pro",
    includedSeats: 5,
    extraSeatPriceUSD: 7,
    extraSeatPriceINR: 499,
    maxMessagesMonthly: 50000,
    hasAiCopilot: true,
    hasAutoReplyBot: true,
    hasKanbanPipeline: true,
    hasDeveloperApi: false,
    hasCustomAiTraining: false,
    hasMultiWaba: false,
  },
  enterprise: {
    tier: "enterprise",
    includedSeats: 10,
    extraSeatPriceUSD: 10,
    extraSeatPriceINR: 699,
    maxMessagesMonthly: 99999999,
    hasAiCopilot: true,
    hasAutoReplyBot: true,
    hasKanbanPipeline: true,
    hasDeveloperApi: true,
    hasCustomAiTraining: true,
    hasMultiWaba: true,
  },
};

/**
 * Get feature limits for a given plan tier
 */
export function getPlanLimits(tier?: string | null): PlanLimits {
  const normalizedTier = (tier || "").toLowerCase() as PlanTier;
  return PLAN_LIMITS_MAP[normalizedTier] || PLAN_LIMITS_MAP.starter;
}

/**
 * Check if a specific feature is enabled for a given plan tier
 */
export function isFeatureAllowed(
  tier: string | null | undefined,
  feature: keyof Pick<
    PlanLimits,
    | "hasAiCopilot"
    | "hasAutoReplyBot"
    | "hasKanbanPipeline"
    | "hasDeveloperApi"
    | "hasCustomAiTraining"
    | "hasMultiWaba"
  >
): boolean {
  const limits = getPlanLimits(tier);
  return !!limits[feature];
}

export function isTrialActive(
  subscriptionStatus?: string | null,
  trialEndsAt?: string | Date | null
): boolean {
  if (subscriptionStatus === "active" || subscriptionStatus === "authenticated") {
    return false;
  }
  if (!trialEndsAt) return false;
  const trialEnd = new Date(trialEndsAt);
  return trialEnd > new Date();
}

export function getTrialDaysLeft(trialEndsAt?: string | Date | null): number {
  if (!trialEndsAt) return 0;
  const trialEnd = new Date(trialEndsAt);
  const diffMs = trialEnd.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

