-- ===========================================================================
-- Onboarding + global seed data
--
-- Run after 0001_init.sql. Safe to re-run: the writer seed is idempotent.
--
-- Problem this solves: handle_new_user() creates a profile, but a fresh signup
-- belongs to no organization, so every RLS policy denies them and the
-- dashboard is empty. bootstrap_organization() gives a new user their own org
-- and makes them its owner.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- Create an organization for the signed-in user and make them owner.
--
-- SECURITY DEFINER because the caller is not yet a member of anything, so the
-- org_insert / membership_insert policies would reject them. Guarded: it
-- refuses if the caller already belongs to an org, so it cannot be called
-- repeatedly to spawn orgs.
-- --------------------------------------------------------------------------
create or replace function public.bootstrap_organization(org_name text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org  organizations;
  v_slug text;
  v_uid  uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'must be signed in';
  end if;

  if exists (select 1 from memberships where user_id = v_uid) then
    raise exception 'user already belongs to an organization';
  end if;

  if coalesce(btrim(org_name), '') = '' then
    raise exception 'organization name is required';
  end if;

  -- URL-safe slug, de-duplicated with a short random suffix if taken.
  v_slug := regexp_replace(lower(btrim(org_name)), '[^a-z0-9]+', '-', 'g');
  v_slug := btrim(v_slug, '-');
  if v_slug = '' then v_slug := 'workspace'; end if;
  if exists (select 1 from organizations where slug = v_slug) then
    v_slug := v_slug || '-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 6);
  end if;

  insert into organizations (name, slug, plan, word_credits_total, word_credits_remaining, renewal_date)
  values (btrim(org_name), v_slug, 'Growth Tier', 25000, 25000, (current_date + interval '1 month')::date)
  returning * into v_org;

  insert into memberships (org_id, user_id, role)
  values (v_org.id, v_uid, 'owner');

  insert into activities (org_id, actor_type, actor_id, actor_name, type, payload)
  select v_org.id, 'client', v_uid, coalesce(p.full_name, 'A new user'), 'member_invited',
         jsonb_build_object('email', p.email, 'role', 'owner')
    from profiles p where p.id = v_uid;

  return v_org;
end;
$$;

-- --------------------------------------------------------------------------
-- Convenience: the caller's current org id (or null). Used by the app to
-- decide whether to show onboarding.
-- --------------------------------------------------------------------------
create or replace function public.my_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select org_id from memberships where user_id = auth.uid() order by created_at limit 1;
$$;

-- --------------------------------------------------------------------------
-- Global writer roster (agency staff, shared across orgs).
-- Mirrors lib/fixtures/writers.ts so the app looks the same after migrating.
-- --------------------------------------------------------------------------
insert into writers (full_name, avatar_url, title, bio, specialties, active)
select * from (values
  ('Elena Rostova',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
   'Senior SaaS & AI Tech Writer',
   'Ex-Wired contributor specializing in enterprise software, developer tooling, and applied machine learning.',
   array['SaaS','AI/ML','B2B Tech','SEO Pillars'], true),
  ('Marcus Vance',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
   'Conversion Copywriter & Product Strategist',
   'Crafts high-converting landing pages, email nurture funnels, and executive thought leadership articles.',
   array['Landing Pages','Email Copy','Product Launches'], true),
  ('Sarah Chen',
   'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
   'Fintech & Data Content Specialist',
   'Former financial analyst turned content strategist, creating authoritative whitepapers and case studies.',
   array['Fintech','Data Analytics','Case Studies','Whitepapers'], true),
  ('David Morales',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
   'B2B Storyteller & Journalist',
   'Focuses on compelling customer success stories, executive interviews, and industry trend reports.',
   array['Customer Stories','Interviews','Thought Leadership'], true)
) as seed(full_name, avatar_url, title, bio, specialties, active)
where not exists (select 1 from writers w where w.full_name = seed.full_name);
