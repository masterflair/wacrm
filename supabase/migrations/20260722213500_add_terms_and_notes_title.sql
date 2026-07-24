-- Add default terms columns to accounts table
ALTER TABLE accounts
ADD COLUMN default_terms_title TEXT,
ADD COLUMN default_terms TEXT;

-- Add notes_title column to quotations table
ALTER TABLE quotations
ADD COLUMN notes_title TEXT;
