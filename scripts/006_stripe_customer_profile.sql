-- Add stripe_customer_id to profiles table
-- This becomes the single source of truth for which Stripe customer a user is
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
