-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products" ON products FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (user_id = auth.uid());
