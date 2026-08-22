-- Separate the stable Lestly profile id from the optional Supabase Auth id.
-- Existing accounts keep their current ids; management-only students have no auth_user_id.

ALTER TABLE public.profiles
  ADD COLUMN auth_user_id uuid,
  ADD COLUMN contact_email text;

UPDATE public.profiles p
SET auth_user_id = p.profile_id,
    contact_email = u.email
FROM auth.users u
WHERE u.id = p.profile_id;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_profile_id_users_id_fk;

ALTER TABLE public.organization_members
  DROP CONSTRAINT IF EXISTS organization_members_profile_id_users_id_fk;

ALTER TABLE public.profiles
  ALTER COLUMN profile_id SET DEFAULT gen_random_uuid();

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_auth_user_id_key UNIQUE (auth_user_id),
  ADD CONSTRAINT profiles_auth_user_id_users_id_fk
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX profiles_contact_email_idx
  ON public.profiles (lower(contact_email))
  WHERE contact_email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.profile_id
  FROM public.profiles p
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.profiles p ON p.profile_id = om.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND om.organization_id = org_id
      AND om.state = 'NORMAL'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.profiles p ON p.profile_id = om.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND om.organization_id = org_id
      AND om.role = 'ADMIN'
      AND om.state = 'NORMAL'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT om.organization_id
  FROM public.organization_members om
  JOIN public.profiles p ON p.profile_id = om.profile_id
  WHERE p.auth_user_id = auth.uid()
    AND om.state = 'NORMAL'
  LIMIT 1;
$$;

DROP POLICY IF EXISTS "edit-profile-policy" ON public.profiles;
DROP POLICY IF EXISTS "delete-profile-policy" ON public.profiles;
DROP POLICY IF EXISTS "select-profile-policy" ON public.profiles;
DROP POLICY IF EXISTS "admin-select-org-member-profiles-policy" ON public.profiles;
DROP POLICY IF EXISTS "admin-update-org-member-profiles-policy" ON public.profiles;

CREATE POLICY "edit-profile-policy" ON public.profiles
FOR UPDATE TO authenticated
USING (auth_user_id = (SELECT auth.uid()))
WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "delete-profile-policy" ON public.profiles
FOR DELETE TO authenticated
USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "select-profile-policy" ON public.profiles
FOR SELECT TO authenticated
USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "admin-select-org-member-profiles-policy" ON public.profiles
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.organization_members target_membership
  WHERE target_membership.profile_id = profiles.profile_id
    AND public.is_org_admin(target_membership.organization_id)
));

CREATE POLICY "admin-update-org-member-profiles-policy" ON public.profiles
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.organization_members target_membership
  WHERE target_membership.profile_id = profiles.profile_id
    AND public.is_org_admin(target_membership.organization_id)
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.organization_members target_membership
  WHERE target_membership.profile_id = profiles.profile_id
    AND public.is_org_admin(target_membership.organization_id)
));

DROP POLICY IF EXISTS "select-own-membership-policy" ON public.organization_members;
CREATE POLICY "select-own-membership-policy" ON public.organization_members
FOR SELECT TO authenticated
USING (profile_id = public.get_current_profile_id());

DROP POLICY IF EXISTS "student-select-own-schedules-policy" ON public.schedules;
DROP POLICY IF EXISTS "student-insert-own-schedules-policy" ON public.schedules;
DROP POLICY IF EXISTS "student-delete-own-schedules-policy" ON public.schedules;

CREATE POLICY "student-select-own-schedules-policy" ON public.schedules
FOR SELECT TO authenticated
USING (
  student_id = public.get_current_profile_id()
  AND public.is_org_member(organization_id)
);

CREATE POLICY "student-insert-own-schedules-policy" ON public.schedules
FOR INSERT TO authenticated
WITH CHECK (
  student_id = public.get_current_profile_id()
  AND public.is_org_member(organization_id)
);

CREATE POLICY "student-delete-own-schedules-policy" ON public.schedules
FOR DELETE TO authenticated
USING (
  student_id = public.get_current_profile_id()
  AND public.is_org_member(organization_id)
  AND start_time::date > CURRENT_DATE
);

CREATE TABLE public.student_invites (
  invite_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(organization_id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(profile_id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles(profile_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_invites_expiry_after_creation CHECK (expires_at > created_at)
);

CREATE INDEX student_invites_active_profile_idx
  ON public.student_invites (profile_id, expires_at DESC)
  WHERE used_at IS NULL AND revoked_at IS NULL;

ALTER TABLE public.student_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin-select-student-invites-policy" ON public.student_invites
FOR SELECT TO authenticated
USING (public.is_org_admin(organization_id));

CREATE POLICY "admin-insert-student-invites-policy" ON public.student_invites
FOR INSERT TO authenticated
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "admin-update-student-invites-policy" ON public.student_invites
FOR UPDATE TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE OR REPLACE FUNCTION public.claim_student_invite(p_token_hash text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auth_user_id uuid := auth.uid();
  v_invite public.student_invites%ROWTYPE;
  v_bootstrap_profile_id uuid;
BEGIN
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  SELECT * INTO v_invite
  FROM public.student_invites
  WHERE token_hash = p_token_hash
  FOR UPDATE;

  IF v_invite.invite_id IS NULL
     OR v_invite.used_at IS NOT NULL
     OR v_invite.revoked_at IS NOT NULL
     OR v_invite.expires_at <= now() THEN
    RAISE EXCEPTION 'invalid_or_expired_invite';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = v_invite.organization_id
      AND om.profile_id = v_invite.profile_id
      AND om.role = 'STUDENT'
      AND om.state = 'NORMAL'
  ) THEN
    RAISE EXCEPTION 'student_not_eligible';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.profile_id = v_invite.profile_id
      AND p.auth_user_id IS NOT NULL
      AND p.auth_user_id <> v_auth_user_id
  ) THEN
    RAISE EXCEPTION 'student_already_linked';
  END IF;

  SELECT p.profile_id INTO v_bootstrap_profile_id
  FROM public.profiles p
  WHERE p.auth_user_id = v_auth_user_id
  FOR UPDATE;

  IF v_bootstrap_profile_id IS NOT NULL
     AND v_bootstrap_profile_id <> v_invite.profile_id THEN
    IF EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.profile_id = v_bootstrap_profile_id
    ) THEN
      RAISE EXCEPTION 'account_already_in_use';
    END IF;

    DELETE FROM public.profiles
    WHERE profile_id = v_bootstrap_profile_id;
  END IF;

  UPDATE public.profiles
  SET auth_user_id = v_auth_user_id,
      updated_at = now()
  WHERE profile_id = v_invite.profile_id;

  UPDATE public.student_invites
  SET used_at = now()
  WHERE invite_id = v_invite.invite_id;

  RETURN v_invite.profile_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_student_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_student_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_profile_id() TO authenticated;

-- auth_user_id is an identity boundary. Normal authenticated table updates may
-- edit student details, but only a service operation or the claim RPC may link it.
CREATE OR REPLACE FUNCTION public.protect_profile_auth_link()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.auth_user_id IS DISTINCT FROM NEW.auth_user_id
     AND current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    RAISE EXCEPTION 'auth_link_update_not_allowed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_auth_link
BEFORE UPDATE OF auth_user_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_auth_link();

-- New Auth users still receive a temporary profile. An invite claim atomically
-- replaces that temporary profile with the existing managed student profile.
CREATE OR REPLACE FUNCTION public.handle_sign_up()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name text;
  v_avatar_url text;
  v_marketing_consent boolean;
BEGIN
  v_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    'Anonymous'
  );
  v_avatar_url := NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', '');
  v_marketing_consent := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'marketing_consent', '')::boolean,
    false
  );

  INSERT INTO public.profiles (
    profile_id, auth_user_id, contact_email, name, avatar_url, marketing_consent
  ) VALUES (
    NEW.id, NEW.id, NEW.email, v_name, v_avatar_url, v_marketing_consent
  );

  RETURN NEW;
END;
$$;

-- Keep the latest notification trigger definitions compatible without copying
-- their large bodies: rewrite only the identity assumptions introduced earlier.
DO $$
DECLARE
  v_name text;
  v_definition text;
BEGIN
  FOREACH v_name IN ARRAY ARRAY['on_schedule_insert', 'on_schedule_delete'] LOOP
    SELECT pg_get_functiondef(p.oid) INTO v_definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = v_name
    LIMIT 1;

    IF v_definition IS NULL THEN
      CONTINUE;
    END IF;

    v_definition := replace(v_definition,
      'NEW.student_id = auth.uid()',
      'NEW.student_id = public.get_current_profile_id()');
    v_definition := replace(v_definition,
      'OLD.student_id = auth.uid()',
      'OLD.student_id = public.get_current_profile_id()');
    v_definition := replace(v_definition,
      'JOIN auth.users u ON u.id = om.profile_id',
      'JOIN auth.users u ON u.id = p.auth_user_id');
    v_definition := replace(v_definition,
      'LEFT JOIN auth.users u ON u.id = p.profile_id',
      'LEFT JOIN auth.users u ON u.id = p.auth_user_id');
    v_definition := replace(v_definition,
      'p.name, p.phone, p.profile_id, u.email',
      'p.name, p.phone, p.profile_id, COALESCE(p.contact_email, u.email)');
    v_definition := replace(v_definition,
      'v_recipient_email, auth.uid(),',
      'v_recipient_email, public.get_current_profile_id(),');
    v_definition := replace(v_definition,
      'auth.uid()',
      'public.get_current_profile_id()');

    EXECUTE v_definition;
  END LOOP;
END;
$$;
