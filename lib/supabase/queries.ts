/**
 * Data access layer between Supabase rows and the app's domain types.
 *
 * The store (lib/context/StoreContext.tsx) talks to this module and never to
 * Supabase directly, so the column-name and shape translation lives in exactly
 * one place. Keep the mappers total: every field the UI reads must be produced
 * here, or it will silently render `undefined`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ActivityEvent,
  BrandVoice,
  Comment,
  Deliverable,
  Notification,
  NotificationPreferences,
  Order,
  Organization,
  Profile,
  Membership,
  Invitation,
  Writer,
} from "@/lib/types";

/* ------------------------------------------------------------------ mappers */

type Row = Record<string, unknown>;

export const toWriter = (r: Row): Writer => ({
  id: r.id as string,
  full_name: r.full_name as string,
  avatar_url: (r.avatar_url as string) ?? "",
  title: (r.title as string) ?? "",
  bio: (r.bio as string) ?? undefined,
  specialties: (r.specialties as string[]) ?? [],
  active: (r.active as boolean) ?? true,
});

export const toDeliverable = (r: Row): Deliverable => ({
  id: r.id as string,
  order_id: r.order_id as string,
  version: r.version as number,
  body_md: (r.body_md as string) ?? "",
  file_url: (r.file_url as string) ?? undefined,
  file_name: (r.file_name as string) ?? undefined,
  file_size: (r.file_size as string) ?? undefined,
  google_doc_url: (r.google_doc_url as string) ?? undefined,
  word_count: (r.word_count as number) ?? 0,
  submitted_at: r.submitted_at as string,
  created_at: r.created_at as string,
});

export const toOrder = (r: Row): Order => ({
  id: r.id as string,
  reference: (r.reference as string) ?? undefined,
  org_id: r.org_id as string,
  created_by: (r.created_by as string) ?? "",
  title: r.title as string,
  content_type: r.content_type as Order["content_type"],
  word_count_target: r.word_count_target as number,
  primary_keyword: (r.primary_keyword as string) ?? "",
  secondary_keywords: (r.secondary_keywords as string[]) ?? [],
  brief: (r.brief as string) ?? "",
  tone: (r.tone as string) ?? "",
  target_audience: (r.target_audience as string) ?? undefined,
  reference_urls: (r.reference_urls as string[]) ?? [],
  due_date: r.due_date as string,
  priority: r.priority as Order["priority"],
  status: r.status as Order["status"],
  assigned_writer_id: (r.assigned_writer_id as string) ?? undefined,
  assigned_writer: r.writers ? toWriter(r.writers as Row) : undefined,
  // Newest version first — DeliverablesViewer treats [0] as "latest".
  deliverables: Array.isArray(r.deliverables)
    ? (r.deliverables as Row[]).map(toDeliverable).sort((a, b) => b.version - a.version)
    : [],
  comments_count: Array.isArray(r.comments)
    ? (r.comments as Row[]).length
    : ((r.comments_count as number) ?? 0),
  outline_required: (r.outline_required as boolean) ?? true,
  plagiarism_check: (r.plagiarism_check as boolean) ?? true,
  meta_description_required: (r.meta_description_required as boolean) ?? true,
  created_at: r.created_at as string,
  updated_at: r.updated_at as string,
});

export const toOrganization = (r: Row): Organization => ({
  id: r.id as string,
  name: r.name as string,
  slug: r.slug as string,
  brand_voice: (r.brand_voice as string) ?? "",
  brand_domain: (r.brand_domain as string) ?? undefined,
  style_guide_url: (r.style_guide_url as string) ?? "",
  plan: (r.plan as string) ?? "Growth Tier",
  word_credits_total: (r.word_credits_total as number) ?? 0,
  word_credits_remaining: (r.word_credits_remaining as number) ?? 0,
  renewal_date: (r.renewal_date as string) ?? "",
  created_at: r.created_at as string,
});

export const toBrandVoice = (r: Row): BrandVoice => ({
  summary: (r.brand_voice as string) ?? "",
  formality_level: (r.formality_level as number) ?? 65,
  technical_depth: (r.technical_depth as number) ?? 85,
  forbidden_words: (r.forbidden_words as string[]) ?? [],
});

export const toProfile = (r: Row): Profile => ({
  id: r.id as string,
  full_name: (r.full_name as string) ?? "",
  email: (r.email as string) ?? "",
  avatar_url: (r.avatar_url as string) ?? undefined,
  role_title: (r.role_title as string) ?? undefined,
  timezone: (r.timezone as string) ?? undefined,
  created_at: r.created_at as string,
});

export const toMembership = (r: Row): Membership => ({
  id: r.id as string,
  org_id: r.org_id as string,
  user_id: r.user_id as string,
  role: r.role as Membership["role"],
  profile: r.profiles ? toProfile(r.profiles as Row) : undefined,
  created_at: r.created_at as string,
});

export const toInvitation = (r: Row): Invitation => ({
  id: r.id as string,
  org_id: r.org_id as string,
  email: r.email as string,
  role: r.role as Invitation["role"],
  // The UI shows a name here; the column stores a profile id.
  invited_by: (r.profiles as Row)?.full_name as string ?? "A teammate",
  token: (r.token as string) ?? "",
  status: r.status as Invitation["status"],
  created_at: r.created_at as string,
  expires_at: r.expires_at as string,
});

export const toComment = (r: Row): Comment => ({
  id: r.id as string,
  order_id: r.order_id as string,
  author_type: r.author_type as Comment["author_type"],
  author_id: (r.author_id as string) ?? undefined,
  author_name: (r.profiles as Row)?.full_name as string ?? undefined,
  author_avatar: (r.profiles as Row)?.avatar_url as string ?? undefined,
  writer_id: (r.writer_id as string) ?? undefined,
  writer: r.writers ? toWriter(r.writers as Row) : undefined,
  body: r.body as string,
  created_at: r.created_at as string,
});

export const toActivity = (r: Row): ActivityEvent => ({
  id: r.id as string,
  org_id: r.org_id as string,
  order_id: (r.order_id as string) ?? undefined,
  order_title: (r.orders as Row)?.title as string ?? undefined,
  actor_type: r.actor_type as ActivityEvent["actor_type"],
  actor_name: (r.actor_name as string) ?? "",
  type: r.type as ActivityEvent["type"],
  payload: (r.payload as ActivityEvent["payload"]) ?? {},
  created_at: r.created_at as string,
});

export const toNotification = (r: Row): Notification => ({
  id: r.id as string,
  user_id: r.user_id as string,
  event_id: (r.order_id as string) ?? (r.id as string),
  title: r.title as string,
  message: (r.message as string) ?? "",
  order_id: (r.order_id as string) ?? undefined,
  read_at: (r.read_at as string) ?? null,
  created_at: r.created_at as string,
  type: r.type as Notification["type"],
});

export const toNotificationPrefs = (r: Row): NotificationPreferences => ({
  emailDeliverable: r.email_deliverable as boolean,
  emailRevision: r.email_revision as boolean,
  emailComment: r.email_comment as boolean,
  emailWeeklyDigest: r.email_weekly_digest as boolean,
  inAppStatus: r.in_app_status as boolean,
  inAppComment: r.in_app_comment as boolean,
  inAppDeliverable: r.in_app_deliverable as boolean,
});

/* ------------------------------------------------------------------ selects */

// Nested selects so one round trip returns an order with its writer,
// deliverables and comment count.
const ORDER_SELECT = `
  *,
  writers ( * ),
  deliverables ( * ),
  comments ( id )
`;

export interface WorkspaceSnapshot {
  organization: Organization | null;
  brandVoice: BrandVoice | null;
  orders: Order[];
  commentsMap: Record<string, Comment[]>;
  activities: ActivityEvent[];
  notifications: Notification[];
  memberships: Membership[];
  invitations: Invitation[];
  currentUser: Profile | null;
  notificationPrefs: NotificationPreferences | null;
}

/**
 * One-shot load of everything the dashboard needs, in parallel.
 *
 * Returns nulls rather than throwing when the user has no organization yet —
 * the caller decides whether that means "onboarding" or "error".
 */
export async function loadWorkspace(
  supabase: SupabaseClient,
  userId: string
): Promise<WorkspaceSnapshot> {
  const { data: membershipRows } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", userId)
    .limit(1);

  const orgId = membershipRows?.[0]?.org_id as string | undefined;

  const empty: WorkspaceSnapshot = {
    organization: null,
    brandVoice: null,
    orders: [],
    commentsMap: {},
    activities: [],
    notifications: [],
    memberships: [],
    invitations: [],
    currentUser: null,
    notificationPrefs: null,
  };

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const { data: prefsRow } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!orgId) {
    return {
      ...empty,
      currentUser: profileRow ? toProfile(profileRow) : null,
      notificationPrefs: prefsRow ? toNotificationPrefs(prefsRow) : null,
    };
  }

  const [orgRes, ordersRes, activitiesRes, notifsRes, membersRes, invitesRes] =
    await Promise.all([
      supabase.from("organizations").select("*").eq("id", orgId).maybeSingle(),
      supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("org_id", orgId)
        .order("created_at", { ascending: false }),
      supabase
        .from("activities")
        .select("*, orders ( title )")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("memberships")
        .select("*, profiles ( * )")
        .eq("org_id", orgId)
        .order("created_at"),
      supabase
        .from("invitations")
        .select("*, profiles ( full_name )")
        .eq("org_id", orgId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

  const orders = (ordersRes.data ?? []).map(toOrder);

  // Comments for every order in one query, then grouped by order id.
  const commentsMap: Record<string, Comment[]> = {};
  if (orders.length) {
    const { data: commentRows } = await supabase
      .from("comments")
      .select("*, profiles ( full_name, avatar_url ), writers ( * )")
      .in(
        "order_id",
        orders.map((o) => o.id)
      )
      .order("created_at");

    for (const row of commentRows ?? []) {
      const c = toComment(row);
      (commentsMap[c.order_id] ||= []).push(c);
    }
  }

  return {
    organization: orgRes.data ? toOrganization(orgRes.data) : null,
    brandVoice: orgRes.data ? toBrandVoice(orgRes.data) : null,
    orders,
    commentsMap,
    activities: (activitiesRes.data ?? []).map(toActivity),
    notifications: (notifsRes.data ?? []).map(toNotification),
    memberships: (membersRes.data ?? []).map(toMembership),
    invitations: (invitesRes.data ?? []).map(toInvitation),
    currentUser: profileRow ? toProfile(profileRow) : null,
    notificationPrefs: prefsRow ? toNotificationPrefs(prefsRow) : null,
  };
}

/** Re-fetch a single order with all its nested relations. */
export async function fetchOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<Order | null> {
  const { data } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();
  return data ? toOrder(data) : null;
}
