-- Create quotations table
CREATE TABLE quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quotation_items table
CREATE TABLE quotation_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quotations" ON quotations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own quotations" ON quotations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own quotations" ON quotations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own quotations" ON quotations FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own quotation items" ON quotation_items FOR SELECT USING (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));
CREATE POLICY "Users can insert their own quotation items" ON quotation_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));
CREATE POLICY "Users can update their own quotation items" ON quotation_items FOR UPDATE USING (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));
CREATE POLICY "Users can delete their own quotation items" ON quotation_items FOR DELETE USING (EXISTS (SELECT 1 FROM quotations WHERE quotations.id = quotation_items.quotation_id AND quotations.user_id = auth.uid()));
