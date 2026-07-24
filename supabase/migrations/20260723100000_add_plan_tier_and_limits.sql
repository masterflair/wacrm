-- ============================================================
-- 20260723100000_add_plan_tier_and_limits.sql
-- Add plan_tier and extra_seats to accounts for Supabase feature gating
-- ============================================================

ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'pro',
ADD COLUMN IF NOT EXISTS extra_seats INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- Function to return plan limits and feature flags (including trial calculation)
CREATE OR REPLACE FUNCTION get_account_plan_limits(target_account_id UUID)
RETURNS TABLE (
  plan_tier TEXT,
  subscription_status TEXT,
  is_trial_active BOOLEAN,
  trial_days_left INT,
  included_seats INT,
  extra_seats INT,
  max_seats INT,
  max_messages INT,
  has_ai_copilot BOOLEAN,
  has_auto_reply BOOLEAN,
  has_kanban BOOLEAN,
  has_developer_api BOOLEAN
) AS $$
DECLARE
  v_tier TEXT;
  v_status TEXT;
  v_trial_ends TIMESTAMPTZ;
  v_trial_active BOOLEAN := FALSE;
  v_days_left INT := 0;
  v_extra INT;
  v_included INT := 3;
  v_max_msg INT := 10000;
  v_ai BOOLEAN := FALSE;
  v_auto BOOLEAN := FALSE;
  v_kanban BOOLEAN := FALSE;
  v_api BOOLEAN := FALSE;
BEGIN
  SELECT 
    COALESCE(a.plan_tier, 'pro'), 
    COALESCE(a.subscription_status, 'trialing'), 
    a.trial_ends_at,
    COALESCE(a.extra_seats, 0)
  INTO v_tier, v_status, v_trial_ends, v_extra
  FROM accounts a
  WHERE a.id = target_account_id;

  -- Calculate trial status
  IF v_status = 'trialing' OR v_status = 'inactive' THEN
    IF v_trial_ends IS NOT NULL AND v_trial_ends > NOW() THEN
      v_trial_active := TRUE;
      v_days_left := GREATEST(0, EXTRACT(DAY FROM (v_trial_ends - NOW()))::INT);
      -- During active trial, grant Pro plan access!
      v_tier := 'pro';
    ELSE
      v_trial_active := FALSE;
      v_days_left := 0;
    END IF;
  END IF;

  IF v_tier = 'pro' THEN
    v_included := 5;
    v_max_msg := 50000;
    v_ai := TRUE;
    v_auto := TRUE;
    v_kanban := TRUE;
    v_api := FALSE;
  ELSIF v_tier = 'enterprise' THEN
    v_included := 10;
    v_max_msg := 99999999;
    v_ai := TRUE;
    v_auto := TRUE;
    v_kanban := TRUE;
    v_api := TRUE;
  END IF;

  RETURN QUERY SELECT 
    v_tier,
    v_status,
    v_trial_active,
    v_days_left,
    v_included,
    v_extra,
    (v_included + v_extra),
    v_max_msg,
    v_ai,
    v_auto,
    v_kanban,
    v_api;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
