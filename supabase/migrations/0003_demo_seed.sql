-- ===========================================================================
-- seed_demo_data() — fill the caller's organization with realistic sample data.
--
-- Optional. Run the migration to install the function, then call it once from
-- the app (or from the SQL editor while signed in) to populate a workspace.
--
-- Exists because a brand-new org is completely empty, which makes it hard to
-- tell "working but no data" from "broken". It mirrors lib/fixtures/orders.ts:
-- one order in every status, so every UI branch has something to render.
--
-- Idempotent: refuses to run if the org already has orders.
-- ===========================================================================

create or replace function public.seed_demo_data()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org      uuid := my_org_id();
  v_uid      uuid := auth.uid();
  v_elena    uuid;
  v_marcus   uuid;
  v_sarah    uuid;
  v_order    uuid;
  v_deliv    uuid;
  v_count    integer := 0;
begin
  if v_org is null then
    raise exception 'no organization for this user';
  end if;

  if exists (select 1 from orders where org_id = v_org) then
    raise exception 'organization already has orders; refusing to seed';
  end if;

  select id into v_elena  from writers where full_name = 'Elena Rostova' limit 1;
  select id into v_marcus from writers where full_name = 'Marcus Vance'  limit 1;
  select id into v_sarah  from writers where full_name = 'Sarah Chen'    limit 1;

  -- 1. Draft (no writer, no credits spent)
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, target_audience, due_date,
                      priority, status)
  values (v_org, v_uid,
          'Q4 Customer Retention Campaign: Re-engaging Inactive Workspace Admins',
          'email_sequence', 1200, 'customer retention email sequence',
          'A five-part win-back sequence for admins who have not logged in for 60+ days.',
          'Warm, direct, lightly urgent', 'Lapsed workspace administrators',
          current_date + 15, 'standard', 'draft');
  v_count := v_count + 1;

  -- 2. Submitted
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, target_audience, due_date,
                      priority, status, assigned_writer_id)
  values (v_org, v_uid,
          'Comparison Guide: GraphQL vs gRPC vs REST for Internal Microservices',
          'seo_article', 2200, 'graphql vs grpc vs rest',
          'Even-handed comparison with a decision matrix and latency benchmarks.',
          'Authoritative, technical', 'Platform engineers',
          current_date + 8, 'standard', 'submitted', v_elena);
  v_count := v_count + 1;

  -- 3. In queue
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, due_date, priority, status)
  values (v_org, v_uid,
          'Series B Funding Announcement & Global Expansion Press Release',
          'press_release', 600, 'series b funding announcement',
          'AP-style release covering the raise, lead investor, and hiring plans.',
          'Formal, newsworthy', current_date + 6, 'high', 'in_queue');
  v_count := v_count + 1;

  -- 4. Writing
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, due_date, priority, status,
                      assigned_writer_id)
  values (v_org, v_uid,
          'Why Modern Microservices Architecture Demands Event-Driven Ingestion',
          'blog_post', 1200, 'event driven ingestion',
          'Argue the case for event-driven pipelines with two customer examples.',
          'Opinionated but evidence-led', current_date + 5, 'standard', 'writing', v_elena)
  returning id into v_order;
  v_count := v_count + 1;

  insert into activities (org_id, order_id, actor_type, actor_name, type, payload)
  values (v_org, v_order, 'writer', 'Elena Rostova', 'writing_started', '{}');

  -- 5. In QA review
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, due_date, priority, status,
                      assigned_writer_id)
  values (v_org, v_uid,
          'The 2026 State of Cloud Compliance & SOC 2 Continuous Auditing',
          'whitepaper', 3500, 'soc 2 continuous auditing',
          'Research-backed whitepaper with survey data and an auditor interview.',
          'Formal, research-led', current_date + 10, 'standard', 'in_review', v_sarah);
  v_count := v_count + 1;

  -- 6. Delivered, with a deliverable to review
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, due_date, priority, status,
                      assigned_writer_id)
  values (v_org, v_uid,
          'High-Converting Hero & Feature Copy for CloudInfra Observability Engine',
          'landing_page', 800, 'observability platform landing page',
          'Hero, three feature blocks, social proof, and a closing CTA.',
          'Punchy, benefit-first', current_date + 1, 'urgent', 'delivered', v_marcus)
  returning id into v_order;
  v_count := v_count + 1;

  insert into deliverables (order_id, version, word_count, file_name, body_md)
  values (v_order, 1, 812, 'cloudinfra-hero-copy-v1.docx',
$md$# See every request. Fix issues before your users notice.

CloudInfra Observability unifies traces, metrics, and logs into one timeline — so your on-call engineer stops guessing.

## Built for engineers who are tired of tab-hopping

Most observability tools make you correlate three dashboards by hand at 3am. CloudInfra collapses that into a single request timeline.

- **One timeline, every signal.** Traces, metrics, and logs stitched by request id.
- **Alerts that explain themselves.** Every alert links to the exact span that regressed.
- **Ninety-day retention as standard.** No sampling, no surprise overage bills.

> "We cut mean time to resolution from 47 minutes to under 9. The timeline view alone paid for the migration."
> — Priya Raman, VP Engineering

## Pricing that scales the way you do

| Plan | Ingest | Retention | Price |
|---|---|---|---|
| Team | 50 GB/mo | 30 days | $290/mo |
| Growth | 250 GB/mo | 90 days | $940/mo |
| Enterprise | Custom | 400 days | Talk to us |

Start free for 14 days. No credit card, no sales call.$md$);

  insert into activities (org_id, order_id, actor_type, actor_name, type, payload)
  values (v_org, v_order, 'writer', 'Marcus Vance', 'deliverable_submitted',
          jsonb_build_object('version', 1));

  insert into notifications (user_id, org_id, order_id, title, message, type)
  values (v_uid, v_org, v_order, 'Deliverable ready for review',
          'Marcus Vance submitted v1 of the CloudInfra landing page copy.', 'deliverable');

  -- 7. Revision requested
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, due_date, priority, status,
                      assigned_writer_id)
  values (v_org, v_uid,
          '5-Part Product Onboarding Email Drip for Platform API Developers',
          'email_sequence', 1500, 'developer onboarding emails',
          'Activation sequence ending at first successful API call.',
          'Helpful, concise', current_date + 4, 'standard', 'revision_requested', v_marcus)
  returning id into v_order;
  v_count := v_count + 1;

  insert into deliverables (order_id, version, word_count, body_md)
  values (v_order, 1, 1480,
          '# Welcome to the Platform API' || chr(10) || chr(10) ||
          'Your key is ready. Here is the fastest path to your first successful call.');

  insert into comments (order_id, author_type, body)
  values (v_order, 'client',
          '[Revision Request - TONE]: Emails 3 and 4 read as too salesy. Please refocus on activation.');

  insert into activities (org_id, order_id, actor_type, actor_name, type, payload)
  values (v_org, v_order, 'client', 'You', 'revision_requested', '{}');

  -- 8. Approved & completed
  insert into orders (org_id, created_by, title, content_type, word_count_target,
                      primary_keyword, brief, tone, due_date, priority, status,
                      assigned_writer_id)
  values (v_org, v_uid,
          'Case Study: How AcmePay Scaled Cross-Border B2B Invoicing to $12M ARR',
          'case_study', 1400, 'b2b invoicing case study',
          'Metrics-led customer story with three pull quotes.',
          'Narrative, data-backed', current_date - 4, 'standard', 'approved', v_sarah)
  returning id into v_order;
  v_count := v_count + 1;

  insert into deliverables (order_id, version, word_count, file_name, body_md)
  values (v_order, 1, 1422, 'acmepay-case-study-final.docx',
          '# How AcmePay scaled cross-border invoicing to $12M ARR' || chr(10) || chr(10) ||
          'AcmePay processed 40,000 invoices across 14 currencies in its first year.');

  insert into activities (org_id, order_id, actor_type, actor_name, type, payload)
  values (v_org, v_order, 'client', 'You', 'order_approved', '{}');

  -- A couple of discussion comments on the delivered order.
  insert into comments (order_id, author_type, body)
  select id, 'system', 'Order submitted to production.' from orders
   where org_id = v_org and status = 'delivered' limit 1;

  return v_count;
end;
$$;
