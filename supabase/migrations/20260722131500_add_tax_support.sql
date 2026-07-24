-- Add Tax/GST support to accounts
ALTER TABLE accounts
ADD COLUMN tax_id TEXT,
ADD COLUMN default_tax_rate DECIMAL(5,2) DEFAULT 0.00;

-- Add Tax/GST support to contacts
ALTER TABLE contacts
ADD COLUMN tax_id TEXT;

-- Add Tax/GST support to quotations
ALTER TABLE quotations
ADD COLUMN subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- Backfill subtotal for existing quotations where subtotal = 0 but total_amount > 0
UPDATE quotations
SET subtotal = total_amount
WHERE subtotal = 0 AND total_amount > 0;
