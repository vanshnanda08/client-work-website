-- ===========================================================================
-- "I created an order but I can't see it in Supabase"
--
-- Paste the whole file into the Supabase SQL Editor and Run. Nothing here
-- needs editing. Read the results top to bottom; each section names the
-- conclusion you should draw from it.
--
-- Two things to know about the SQL Editor before you start:
--   * It runs as a privileged role, so it IGNORES row-level security and
--     shows every row in the project — unlike the app, which only ever shows
--     the signed-in user's own organization.
--   * auth.uid() is NULL here. Functions that depend on it —
--     seed_demo_data(), bootstrap_organization(), my_org_id() — cannot be
--     called from this editor. Use the app while signed in.
--
-- Also: the Table Editor sorts by primary key, and orders.id is a random
-- uuid, so a new order does NOT appear at the top of the list. Section 1 is
-- the reliable way to look.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. NEWEST ORDERS IN THE PROJECT, whoever created them.
--    If your order is here, it saved correctly and the problem was only how
--    the Table Editor was sorting.
-- ---------------------------------------------------------------------------
select
  o.reference,
  o.title,
  o.status,
  o.word_count_target,
  org.name                                    as organization,
  coalesce(p.email, '(created_by is null)')   as created_by,
  o.created_at
from orders o
join organizations org on org.id = o.org_id
left join profiles  p   on p.id  = o.created_by
order by o.created_at desc
limit 20;

-- ---------------------------------------------------------------------------
-- 2. EVERY ACCOUNT, its workspace, and how many orders that workspace holds.
--
--    organization = NULL is a real bug: the account exists but belongs to no
--    workspace, so every RLS policy denies it. The app shows an empty
--    dashboard and inserts fail. Fix with section 4.
--
--    Two rows with different organizations means you have signed up twice.
--    Orders created under account A are invisible while signed in as B —
--    that is RLS working as designed, not data loss.
-- ---------------------------------------------------------------------------
select
  u.email,
  u.created_at                     as signed_up,
  u.email_confirmed_at is not null as email_confirmed,
  u.last_sign_in_at,
  org.name                         as organization,
  m.role,
  (select count(*) from orders where org_id = org.id) as orders_in_workspace
from auth.users u
left join memberships   m   on m.user_id = u.id
left join organizations org on org.id = m.org_id
order by u.created_at;

-- ---------------------------------------------------------------------------
-- 3. WORD CREDITS per workspace.
--    Submitting an order costs word_count_target credits and the submit_order()
--    function raises if the balance is short. When that happens the order row
--    is still inserted as a draft — so a "missing" order is often sitting in
--    the Drafts tab. Section 1 will show it with status = 'draft'.
-- ---------------------------------------------------------------------------
select
  org.name,
  org.word_credits_remaining,
  org.word_credits_total,
  count(o.id) filter (where o.status = 'draft') as drafts,
  count(o.id)                                   as total_orders
from organizations org
left join orders o on o.org_id = org.id
group by org.id, org.name, org.word_credits_remaining, org.word_credits_total
order by org.name;

-- ---------------------------------------------------------------------------
-- 4. BACKFILL — only if section 2 showed organization = NULL for your account.
--    Creates a workspace for that account and makes it the owner.
--    Uncomment, put your email in, and run.
-- ---------------------------------------------------------------------------
-- do $$
-- declare v_uid uuid; v_org uuid;
-- begin
--   select id into v_uid from auth.users where email = 'you@example.com';
--   if v_uid is null then raise exception 'no such user'; end if;
--   if exists (select 1 from memberships where user_id = v_uid) then
--     raise notice 'already has a workspace; nothing to do'; return;
--   end if;
--   insert into organizations (name, slug, plan, word_credits_total,
--                              word_credits_remaining, renewal_date)
--   values ('My Workspace',
--           'my-workspace-' || substr(encode(gen_random_bytes(4),'hex'),1,6),
--           'Growth Tier', 25000, 25000, (current_date + interval '1 month')::date)
--   returning id into v_org;
--   insert into memberships (org_id, user_id, role) values (v_org, v_uid, 'owner');
--   raise notice 'created workspace % for %', v_org, v_uid;
-- end $$;
