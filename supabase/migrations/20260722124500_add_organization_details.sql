-- Add organization details to accounts table
ALTER TABLE accounts
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN website TEXT;
