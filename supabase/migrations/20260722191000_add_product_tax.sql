-- Add tax options to products
ALTER TABLE products
ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT NULL;

-- Add tax tracking to quotation items
ALTER TABLE quotation_items
ADD COLUMN taxable BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00;
