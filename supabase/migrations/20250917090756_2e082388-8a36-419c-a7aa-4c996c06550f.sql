-- ADMIN-ONLY WORKFLOW: Database Migration
-- Remove public driver response system, implement admin-controlled assignments

-- 1.1: Extend job_assignments for admin confirmation
ALTER TABLE public.job_assignments
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_by_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_reason text,
  ADD COLUMN IF NOT EXISTS admin_note text;

-- 1.2: Status transition enforcement (admin-only usecase)
CREATE OR REPLACE FUNCTION public.enforce_assignment_transitions()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status NOT IN ('assigned','confirmed','cancelled') THEN
      RAISE EXCEPTION 'invalid status %', NEW.status;
    END IF;

    -- Confirm only from 'assigned'
    IF NEW.status = 'confirmed' AND OLD.status <> 'assigned' THEN
      RAISE EXCEPTION 'confirm allowed only from status=assigned';
    END IF;

    -- Confirm requires admin flag + timestamp
    IF NEW.status = 'confirmed' AND NEW.confirmed_by_admin IS NOT TRUE THEN
      RAISE EXCEPTION 'confirmed_by_admin must be true';
    END IF;
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at := now();
    END IF;

    -- Cancel: set timestamp
    IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_assignment_transitions ON public.job_assignments;
CREATE TRIGGER trg_enforce_assignment_transitions
BEFORE UPDATE ON public.job_assignments
FOR EACH ROW EXECUTE FUNCTION public.enforce_assignment_transitions();

-- 1.3: Remove one-time-token table (no longer needed)
DROP TABLE IF EXISTS public.assignment_response_tokens;

-- 2. Admin RPC Functions

-- 2.1 Admin assign driver
CREATE OR REPLACE FUNCTION public.admin_assign_driver(
  _job_id uuid,
  _driver_id uuid,
  _rate_type text,
  _rate_value numeric,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.job_assignments
    (id, job_id, driver_id, status, assigned_at, rate_type, rate_value, start_date, end_date, admin_note)
  VALUES
    (gen_random_uuid(), _job_id, _driver_id, 'assigned', now(), _rate_type, _rate_value, _start_date, _end_date, _note)
  RETURNING id INTO _id;

  RETURN _id;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_assign_driver(uuid, uuid, text, numeric, date, date, text) TO authenticated;

-- 2.2 Admin confirm assignment
CREATE OR REPLACE FUNCTION public.admin_confirm_assignment(
  _assignment_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.job_assignments
     SET status = 'confirmed',
         confirmed_by_admin = true,
         confirmed_at = COALESCE(confirmed_at, now())
   WHERE id = _assignment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'assignment not found: %', _assignment_id;
  END IF;

  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_confirm_assignment(uuid) TO authenticated;

-- 2.3 Admin cancel assignment
CREATE OR REPLACE FUNCTION public.admin_cancel_assignment(
  _assignment_id uuid,
  _reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT PUBLIC.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.job_assignments
     SET status = 'cancelled',
         cancelled_at = now(),
         cancelled_reason = _reason
   WHERE id = _assignment_id;

  RETURN FOUND;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_cancel_assignment(uuid, text) TO authenticated;

-- 5. Audit trail
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  job_id uuid not null references public.job_requests(id) on delete cascade,
  assignment_id uuid references public.job_assignments(id) on delete set null,
  admin_email text not null,
  note text,
  created_at timestamptz not null default now()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_actions_admin_select ON public.admin_actions
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY admin_actions_admin_insert ON public.admin_actions
  FOR INSERT WITH CHECK (public.is_admin_user());

GRANT SELECT, INSERT ON public.admin_actions TO authenticated;