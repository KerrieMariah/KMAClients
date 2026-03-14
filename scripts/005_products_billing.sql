-- Products catalog table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('one_time', 'recurring')),
  price numeric(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  interval text CHECK (interval IN ('month', 'quarter', 'year')),
  interval_count integer DEFAULT 1,
  features text[] DEFAULT '{}',
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read products (to see product names)
CREATE POLICY "products_select_authenticated" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin full access
CREATE POLICY "admin_full_access_products" ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Rename subscriptions to billing_items
ALTER TABLE public.subscriptions RENAME TO billing_items;

-- Add new columns to billing_items
ALTER TABLE public.billing_items ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.billing_items ADD COLUMN IF NOT EXISTS type text DEFAULT 'recurring' CHECK (type IN ('one_time', 'recurring'));
ALTER TABLE public.billing_items ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.billing_items ADD COLUMN IF NOT EXISTS end_date date;

-- Expand the status check to include 'paid' and 'pending'
ALTER TABLE public.billing_items DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.billing_items DROP CONSTRAINT IF EXISTS billing_items_status_check;
ALTER TABLE public.billing_items ADD CONSTRAINT billing_items_status_check
  CHECK (status IN ('active', 'cancelled', 'past_due', 'paid', 'pending'));

-- Rename the billing_cycle constraint to allow the table rename
-- (constraints follow the table rename automatically in Postgres)

-- Update RLS policy names to match new table name
-- Drop old policies (they were auto-renamed but let's recreate cleanly)
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.billing_items;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.billing_items;
DROP POLICY IF EXISTS "admin_full_access_subscriptions" ON public.billing_items;

CREATE POLICY "billing_items_select_own" ON public.billing_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "billing_items_update_own" ON public.billing_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "admin_full_access_billing_items" ON public.billing_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
