-- ===========================================================================
-- Inkwell — initial schema
--
-- Run this whole file once in the Supabase SQL Editor.
-- It is idempotent-ish: it will error if run twice (types already exist).
-- To start over on a throwaway project: `drop schema public cascade;
-- create schema public;` then re-run.
--
-- Design notes:
--  * Tenancy is per-organization. Every business table carries org_id (directly
--    or via its parent order) and is gated by is_org_member().
--  * RLS is ON for every table. There is no table a client can read freely.
--  * word_credits_remaining is NOT client-writable. Spending credits goes
--    through submit_order(), which checks the balance and debits atomically.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- Enums — mirror the string unions in lib/types.ts exactly.
-- --------------------------------------------------------------------------
create type member_role       as enum ('owner','admin','member');
create type order_status      as enum ('draft','submitted','in_queue','writing','in_review','delivered','revision_requested','approved');
create type priority          as enum ('standard','high','urgent');
create type content_type      as enum ('blog_post','seo_article','landing_page','email_sequence','case_study','whitepaper','press_release','other');
create type author_type       as enum ('client','writer','system');
create type invitation_status as enum ('pending','accepted','revoked','expired');
create type notification_type as enum ('deliverable','comment','status','system');
create type activity_type     as enum ('order_created','writer_assigned','writing_started','deliverable_submitted','revision_requested','order_approved','comment_added','member_invited');

-- --------------------------------------------------------------------------
-- Tables
-- --------------------------------------------------------------------------

create table organizations (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  slug                   text not null unique,
  brand_voice            text not null default '',
  brand_domain           text,
  style_guide_url        text,
  plan                   text not null default 'Growth Tier',
  word_credits_total     integer not null default 25000 check (word_credits_total >= 0),
  word_credits_remaining integer not null default 25000 check (word_credits_remaining >= 0),
  renewal_date           date,
  -- Brand-voice tuning (the `brandVoice` slice in StoreContext).
  formality_level        smallint not null default 65 check (formality_level between 0 and 100),
  technical_depth        smallint not null default 85 check (technical_depth between 0 and 100),
  forbidden_words        text[] not null default '{}',
  created_at             timestamptz not null default now()
);

-- profiles.id IS the auth user id. Populated by the trigger at the bottom.
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  email      text not null,
  avatar_url text,
  role_title text,
  timezone   text default 'America/New_York (EST)',
  created_at timestamptz not null default now()
);

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create index on memberships (user_id);
create index on memberships (org_id);

create table invitations (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  email      text not null,
  role       member_role not null default 'member',
  invited_by uuid references profiles(id) on delete set null,
  token      text not null unique default encode(gen_random_bytes(24),'hex'),
  status     invitation_status not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  unique (org_id, email)
);
create index on invitations (org_id);

-- Writers are agency staff, shared across orgs. Readable by any signed-in
-- user (you need the name/avatar of whoever is on your order); never writable.
create table writers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  avatar_url  text,
  title       text,
  bio         text,
  specialties text[] not null default '{}',
  active      boolean not null default true
);

create table orders (
  id                        uuid primary key default gen_random_uuid(),
  -- Human-facing reference (ORD-1051). Generated by a trigger, never by the client.
  reference                 text unique,
  org_id                    uuid not null references organizations(id) on delete cascade,
  created_by                uuid references profiles(id) on delete set null,
  title                     text not null,
  content_type              content_type not null default 'blog_post',
  word_count_target         integer not null default 1200 check (word_count_target > 0),
  primary_keyword           text not null default '',
  secondary_keywords        text[] not null default '{}',
  brief                     text not null default '',
  tone                      text not null default '',
  target_audience           text,
  reference_urls            text[] not null default '{}',
  due_date                  date not null,
  priority                  priority not null default 'standard',
  status                    order_status not null default 'draft',
  assigned_writer_id        uuid references writers(id) on delete set null,
  outline_required          boolean not null default true,
  plagiarism_check          boolean not null default true,
  meta_description_required boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index on orders (org_id, created_at desc);
create index on orders (org_id, status);

create table deliverables (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  version      integer not null default 1,
  body_md      text not null default '',
  file_url     text,
  file_name    text,
  file_size    text,
  google_doc_url text,
  word_count   integer not null default 0,
  submitted_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (order_id, version)
);
create index on deliverables (order_id);

create table revisions (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  deliverable_id uuid references deliverables(id) on delete set null,
  requested_by   uuid references profiles(id) on delete set null,
  notes          text not null,
  category       text check (category in ('tone','factual','structure','seo','general')),
  status         text not null default 'open' check (status in ('open','addressed')),
  created_at     timestamptz not null default now()
);
create index on revisions (order_id);

create table comments (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  author_type author_type not null default 'client',
  author_id   uuid references profiles(id) on delete set null,
  writer_id   uuid references writers(id) on delete set null,
  body        text not null check (length(btrim(body)) > 0),
  created_at  timestamptz not null default now()
);
create index on comments (order_id, created_at);

create table activities (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  order_id    uuid references orders(id) on delete cascade,
  actor_type  author_type not null default 'client',
  actor_id    uuid references profiles(id) on delete set null,
  actor_name  text not null default '',
  type        activity_type not null,
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index on activities (org_id, created_at desc);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  org_id     uuid not null references organizations(id) on delete cascade,
  order_id   uuid references orders(id) on delete cascade,
  title      text not null,
  message    text not null default '',
  type       notification_type not null default 'status',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index on notifications (user_id, created_at desc);

-- Per-user email/in-app toggles (the `notificationPrefs` slice).
-- NB: appearance/theme deliberately stays in localStorage — it must be
-- readable synchronously before first paint to avoid a flash.
create table notification_preferences (
  user_id             uuid primary key references profiles(id) on delete cascade,
  email_deliverable   boolean not null default true,
  email_revision      boolean not null default true,
  email_comment       boolean not null default true,
  email_weekly_digest boolean not null default false,
  in_app_status       boolean not null default true,
  in_app_comment      boolean not null default true,
  in_app_deliverable  boolean not null default true
);

-- --------------------------------------------------------------------------
-- Helper: org membership test.
--
-- SECURITY DEFINER is essential. A policy on `memberships` that itself queries
-- `memberships` recurses infinitely; running as definer bypasses RLS for this
-- lookup only. `set search_path` prevents search-path hijacking.
-- --------------------------------------------------------------------------
create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where org_id = target_org and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where org_id = target_org
      and user_id = auth.uid()
      and role in ('owner','admin')
  );
$$;

-- True when the signed-in user shares any org with target_user.
-- A SECURITY DEFINER helper rather than an inline subquery in the policy:
-- inline, the subquery would itself be RLS-filtered, which is fragile and
-- hard to reason about.
create or replace function public.shares_org_with(target_user uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from memberships me
    join memberships them on them.org_id = me.org_id
    where me.user_id = auth.uid() and them.user_id = target_user
  );
$$;

-- True when the signed-in user may see this order (used by child tables).
create or replace function public.can_access_order(target_order uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from orders o
    join memberships m on m.org_id = o.org_id
    where o.id = target_order and m.user_id = auth.uid()
  );
$$;

-- --------------------------------------------------------------------------
-- Row level security
-- --------------------------------------------------------------------------
alter table organizations            enable row level security;
alter table profiles                 enable row level security;
alter table memberships              enable row level security;
alter table invitations              enable row level security;
alter table writers                  enable row level security;
alter table orders                   enable row level security;
alter table deliverables             enable row level security;
alter table revisions                enable row level security;
alter table comments                 enable row level security;
alter table activities               enable row level security;
alter table notifications            enable row level security;
alter table notification_preferences enable row level security;

-- Organizations: members read; admins update. No client-side insert/delete.
create policy org_select on organizations for select using (is_org_member(id));
create policy org_update on organizations for update using (is_org_admin(id)) with check (is_org_admin(id));

-- Profiles: you can read anyone who shares an org with you; write only yourself.
create policy profile_select_self on profiles for select using (id = auth.uid());
create policy profile_select_org  on profiles for select using (shares_org_with(id));
create policy profile_update_self on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Memberships: read your orgs' roster; admins manage it.
create policy membership_select on memberships for select using (is_org_member(org_id));
create policy membership_insert on memberships for insert with check (is_org_admin(org_id));
create policy membership_update on memberships for update using (is_org_admin(org_id)) with check (is_org_admin(org_id));
create policy membership_delete on memberships for delete using (is_org_admin(org_id));

create policy invitation_select on invitations for select using (is_org_member(org_id));
create policy invitation_insert on invitations for insert with check (is_org_admin(org_id));
create policy invitation_delete on invitations for delete using (is_org_admin(org_id));

-- Writers: readable by any signed-in user; not client-writable.
create policy writer_select on writers for select to authenticated using (true);

-- Orders: full CRUD within your org. Deleting a non-draft refunds credits
-- via the trigger further down.
create policy order_select on orders for select using (is_org_member(org_id));
create policy order_insert on orders for insert with check (is_org_member(org_id));
create policy order_update on orders for update using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy order_delete on orders for delete using (is_org_member(org_id));

-- Deliverables/revisions/comments inherit access from their order.
create policy deliverable_select on deliverables for select using (can_access_order(order_id));

create policy revision_select on revisions for select using (can_access_order(order_id));
create policy revision_insert on revisions for insert with check (can_access_order(order_id));

create policy comment_select on comments for select using (can_access_order(order_id));
create policy comment_insert on comments for insert with check (can_access_order(order_id));

create policy activity_select on activities for select using (is_org_member(org_id));
create policy activity_insert on activities for insert with check (is_org_member(org_id));

-- Notifications are personal, not org-wide.
create policy notification_select on notifications for select using (user_id = auth.uid());
create policy notification_update on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notification_insert on notifications for insert with check (user_id = auth.uid());

create policy notif_prefs_select on notification_preferences for select using (user_id = auth.uid());
create policy notif_prefs_upsert on notification_preferences for insert with check (user_id = auth.uid());
create policy notif_prefs_update on notification_preferences for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- Word credits must not be client-writable.
--
-- The org_update policy above would otherwise let any admin set
-- word_credits_remaining to anything from the browser console. This trigger
-- pins both credit columns unless the change comes from a SECURITY DEFINER
-- routine (which runs with `is_privileged` set).
-- --------------------------------------------------------------------------
create or replace function public.guard_word_credits()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.privileged', true) = 'on' then
    return new;
  end if;
  if new.word_credits_remaining is distinct from old.word_credits_remaining
     or new.word_credits_total is distinct from old.word_credits_total then
    raise exception 'word credits cannot be modified directly; use submit_order()';
  end if;
  return new;
end;
$$;

create trigger organizations_guard_credits
  before update on organizations
  for each row execute function public.guard_word_credits();

-- --------------------------------------------------------------------------
-- submit_order(): the only way to spend credits.
-- Checks membership, checks balance, debits, flips status, logs activity and
-- notification — all in one transaction.
-- --------------------------------------------------------------------------
create or replace function public.submit_order(p_order_id uuid)
returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order  orders;
  v_org    organizations;
  v_writer writers;
  v_actor  text;
begin
  select * into v_order from orders where id = p_order_id;
  if not found then
    raise exception 'order not found';
  end if;

  if not is_org_member(v_order.org_id) then
    raise exception 'not authorised for this order';
  end if;

  if v_order.status <> 'draft' then
    raise exception 'only drafts can be submitted (status is %)', v_order.status;
  end if;

  select * into v_org from organizations where id = v_order.org_id for update;

  if v_org.word_credits_remaining < v_order.word_count_target then
    raise exception 'insufficient word credits: % remaining, % required',
      v_org.word_credits_remaining, v_order.word_count_target;
  end if;

  select * into v_writer from writers where active order by random() limit 1;
  select coalesce(full_name, 'A teammate') into v_actor from profiles where id = auth.uid();

  perform set_config('app.privileged','on', true);
  update organizations
     set word_credits_remaining = word_credits_remaining - v_order.word_count_target
   where id = v_org.id;
  perform set_config('app.privileged','off', true);

  update orders
     set status = 'submitted',
         assigned_writer_id = coalesce(assigned_writer_id, v_writer.id),
         updated_at = now()
   where id = p_order_id
  returning * into v_order;

  insert into activities (org_id, order_id, actor_type, actor_id, actor_name, type, payload)
  values (v_order.org_id, v_order.id, 'client', auth.uid(), v_actor, 'order_created',
          jsonb_build_object('words', v_order.word_count_target));

  insert into notifications (user_id, org_id, order_id, title, message, type)
  select m.user_id, v_order.org_id, v_order.id,
         'Order submitted to queue',
         v_order.title || ' was submitted and assigned to ' || coalesce(v_writer.full_name,'the editorial team') || '.',
         'status'
    from memberships m
   where m.org_id = v_order.org_id;

  insert into comments (order_id, author_type, body)
  values (v_order.id, 'system',
          'Order submitted to production. Assigned to ' || coalesce(v_writer.full_name,'Agency Editorial Team') || '.');

  return v_order;
end;
$$;

-- Refund credits when a non-draft order is deleted (mirrors deleteOrder()).
create or replace function public.refund_on_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status <> 'draft' then
    perform set_config('app.privileged','on', true);
    update organizations
       set word_credits_remaining = least(word_credits_total,
                                          word_credits_remaining + old.word_count_target)
     where id = old.org_id;
    perform set_config('app.privileged','off', true);
  end if;
  return old;
end;
$$;

create trigger orders_refund_on_delete
  before delete on orders
  for each row execute function public.refund_on_delete();

-- --------------------------------------------------------------------------
-- Human-readable order reference: ORD-1051, ORD-1052, ...
-- --------------------------------------------------------------------------
create sequence order_reference_seq start 1051;

create or replace function public.set_order_reference()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.reference is null then
    new.reference := 'ORD-' || nextval('order_reference_seq');
  end if;
  return new;
end;
$$;

create trigger orders_set_reference
  before insert on orders
  for each row execute function public.set_order_reference();

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger orders_touch_updated_at
  before update on orders
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- New auth user -> profile + notification prefs.
-- Without this, signup succeeds but the app has no profile row to read.
-- --------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
