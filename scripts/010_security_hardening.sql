-- Security hardening: stop clients from granting themselves admin, changing
-- their Stripe linkage, or editing billing state directly through the API.

-- Helper that checks admin status without being subject to profiles RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Profiles ------------------------------------------------------------------

-- Profiles are created by the handle_new_user trigger, never by clients
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS can't restrict individual columns, so block changes to admin-managed
-- columns for any signed-in user who isn't an admin. Service role (webhooks,
-- server actions) and the SQL editor are unaffected.
CREATE OR REPLACE FUNCTION public.protect_profile_admin_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') = 'authenticated' AND NOT public.is_admin() THEN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
       OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
       OR NEW.emergency_phone IS DISTINCT FROM OLD.emergency_phone THEN
      RAISE EXCEPTION 'Not allowed to modify admin-managed profile fields'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_admin_columns ON public.profiles;
CREATE TRIGGER protect_profile_admin_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_admin_columns();

-- Billing items -------------------------------------------------------------

-- Clients must never write billing state; all updates go through the Stripe
-- webhook or server actions using the service role.
DROP POLICY IF EXISTS "billing_items_update_own" ON public.billing_items;
