-- Add Razorpay customer and subscription state to accounts
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive';

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  razorpay_subscription_id TEXT UNIQUE NOT NULL,
  razorpay_plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_start TIMESTAMPTZ,
  current_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions are viewable by account members
CREATE POLICY "Subscriptions are viewable by account members" 
ON subscriptions FOR SELECT 
USING (
  account_id IN (
    SELECT account_id FROM profiles WHERE id = auth.uid()
  )
);

-- Only service role can modify subscriptions (handled via Webhooks)
-- No INSERT/UPDATE/DELETE policies for authenticated users.

-- Create trigger to update `updated_at` automatically
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE PROCEDURE update_subscriptions_updated_at_column();
