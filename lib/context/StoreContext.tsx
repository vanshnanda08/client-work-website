"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Order,
  Organization,
  Comment,
  ActivityEvent,
  Notification,
  OrderStatus,
  Priority,
  ContentType,
  Profile,
  Membership,
  Invitation,
  MemberRole,
  BrandVoice,
  NotificationPreferences,
  AppearancePreferences,
} from "@/lib/types";
import { MOCK_APPEARANCE } from "@/lib/fixtures/organization";
import { createClient } from "@/lib/supabase/client";
import { loadWorkspace } from "@/lib/supabase/queries";

export interface NewOrderInput {
  title: string;
  content_type: ContentType;
  word_count_target: number;
  primary_keyword?: string;
  secondary_keywords?: string[];
  brief: string;
  tone?: string;
  target_audience?: string;
  reference_urls?: string[];
  due_date: string;
  priority: Priority;
  status?: OrderStatus;
}

interface StoreContextType {
  orders: Order[];
  organization: Organization;
  activities: ActivityEvent[];
  notifications: Notification[];
  commentsMap: Record<string, Comment[]>;
  currentUser: Profile;
  memberships: Membership[];
  invitations: Invitation[];
  brandVoice: BrandVoice;
  notificationPrefs: NotificationPreferences;
  appearance: AppearancePreferences;
  /** False until the first Supabase load completes. */
  isHydrated: boolean;
  /** Set when the signed-in user belongs to no organization. */
  needsOnboarding: boolean;
  /** Last write error, surfaced so pages can show it. */
  error: string | null;
  refresh: () => Promise<void>;

  updateCurrentUser: (updates: Partial<Profile>) => Promise<void>;
  createOrder: (orderData: NewOrderInput) => Promise<string>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  submitDraft: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  addComment: (
    orderId: string,
    body: string,
    authorType?: "client" | "writer" | "system"
  ) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  updateBrandVoice: (updates: Partial<BrandVoice>) => Promise<void>;
  updateNotificationPrefs: (updates: Partial<NotificationPreferences>) => Promise<void>;
  updateAppearance: (updates: Partial<AppearancePreferences>) => void;
  /** Populates an empty workspace with sample orders. Returns rows created. */
  seedDemoData: () => Promise<number>;
  /** Creates the org + owner membership for a user who belongs to none. */
  bootstrapWorkspace: (name: string) => Promise<void>;
  inviteMember: (email: string, role: MemberRole) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  updateMemberRole: (membershipId: string, role: MemberRole) => Promise<void>;
  removeMember: (membershipId: string) => Promise<void>;
  signOut: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

/**
 * Appearance stays in localStorage rather than the database: it is a
 * per-device preference, and the pre-paint script in app/layout.tsx reads it
 * synchronously to avoid a flash of the wrong theme. A DB round trip cannot
 * happen before first paint.
 */
const APPEARANCE_KEY = "inkwell_appearance_v2";

/** Placeholder identity shown for the moment before the first load resolves. */
const EMPTY_ORG: Organization = {
  id: "",
  name: "Loading…",
  slug: "",
  brand_voice: "",
  style_guide_url: "",
  plan: "—",
  word_credits_total: 0,
  word_credits_remaining: 0,
  renewal_date: "",
  created_at: new Date().toISOString(),
};

const EMPTY_USER: Profile = {
  id: "",
  full_name: "",
  email: "",
  created_at: new Date().toISOString(),
};

const EMPTY_BRAND_VOICE: BrandVoice = {
  summary: "",
  formality_level: 65,
  technical_depth: 85,
  forbidden_words: [],
};

const EMPTY_PREFS: NotificationPreferences = {
  emailDeliverable: true,
  emailRevision: true,
  emailComment: true,
  emailWeeklyDigest: false,
  inAppStatus: true,
  inAppComment: true,
  inAppDeliverable: true,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [organization, setOrganization] = useState<Organization>(EMPTY_ORG);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [currentUser, setCurrentUser] = useState<Profile>(EMPTY_USER);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [brandVoice, setBrandVoice] = useState<BrandVoice>(EMPTY_BRAND_VOICE);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>(EMPTY_PREFS);
  const [appearance, setAppearance] = useState<AppearancePreferences>(MOCK_APPEARANCE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const prefsRef = useRef(notificationPrefs);
  useEffect(() => {
    prefsRef.current = notificationPrefs;
  }, [notificationPrefs]);

  /** Pull the whole workspace and replace local state with it. */
  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      userIdRef.current = null;
      setIsHydrated(true);
      return;
    }
    userIdRef.current = user.id;

    const snap = await loadWorkspace(supabase, user.id);

    setNeedsOnboarding(!snap.organization);
    if (snap.organization) setOrganization(snap.organization);
    if (snap.brandVoice) setBrandVoice(snap.brandVoice);
    if (snap.currentUser) setCurrentUser(snap.currentUser);
    if (snap.notificationPrefs) setNotificationPrefs(snap.notificationPrefs);
    setOrders(snap.orders);
    setCommentsMap(snap.commentsMap);
    setActivities(snap.activities);
    setNotifications(snap.notifications);
    setMemberships(snap.memberships);
    setInvitations(snap.invitations);
    setIsHydrated(true);
  }, [supabase]);

  // Initial load, plus reload whenever the auth state changes (sign in/out).
  /* eslint-disable react-hooks/set-state-in-effect -- one-shot pull from an
     external system (Supabase); cannot happen during render. */
  useEffect(() => {
    let active = true;
    refresh().catch((e) => {
      if (active) {
        setError(e instanceof Error ? e.message : String(e));
        setIsHydrated(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        refresh().catch(() => {});
      }
    });

    // Appearance is device-local; read it once on mount.
    try {
      const raw = localStorage.getItem(APPEARANCE_KEY);
      if (raw) setAppearance(JSON.parse(raw));
    } catch {
      /* ignore malformed value */
    }

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refresh, supabase]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /**
   * Wrap a write so failures surface instead of vanishing.
   *
   * On failure it also re-reads the workspace. Several actions below update
   * state optimistically *before* the write; when the write throws, that local
   * state is a lie the user would keep seeing (an order badge showing a status
   * the database rejected). The re-read discards it. A failure inside the
   * re-read itself is swallowed so the caller still sees the original error.
   */
  const guard = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        setError(null);
        return await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        await refresh().catch(() => {});
        throw e;
      }
    },
    [refresh]
  );

  /* ------------------------------------------------------------- orders */

  const createOrder = useCallback(
    async (data: NewOrderInput): Promise<string> =>
      guard(async () => {
        const isDraft = data.status === "draft";

        // Before the first load resolves, organization.id is "" — which
        // Postgres rejects as an invalid uuid with an opaque message. Fail
        // with something a user can act on instead.
        if (!organization.id) {
          throw new Error("Workspace is still loading. Try again in a moment.");
        }

        const { data: row, error: insertError } = await supabase
          .from("orders")
          .insert({
            org_id: organization.id,
            created_by: currentUser.id || null,
            title: data.title,
            content_type: data.content_type,
            word_count_target: Number(data.word_count_target) || 1200,
            primary_keyword: data.primary_keyword ?? "",
            secondary_keywords: data.secondary_keywords ?? [],
            brief: data.brief,
            tone: data.tone ?? "Authoritative, Clear & Engaging",
            target_audience: data.target_audience ?? "B2B Tech Buyers",
            reference_urls: data.reference_urls ?? [],
            due_date: data.due_date,
            priority: data.priority ?? "standard",
            status: "draft",
          })
          .select("*")
          .single();

        if (insertError) throw new Error(insertError.message);

        const orderId = row.id as string;

        // Spending credits and assigning a writer happens server-side, so the
        // balance cannot be tampered with from the browser.
        if (!isDraft) {
          const { error: rpcError } = await supabase.rpc("submit_order", {
            p_order_id: orderId,
          });
          if (rpcError) throw new Error(rpcError.message);
        }

        await refresh();
        return orderId;
      }),
    [supabase, organization.id, currentUser.id, refresh, guard]
  );

  const updateOrder = useCallback(
    async (orderId: string, updates: Partial<Order>) =>
      guard(async () => {
        // Strip relations and generated columns — they are not real columns.
        const {
          assigned_writer: _w,
          deliverables: _d,
          comments_count: _c,
          reference: _r,
          id: _i,
          org_id: _o,
          created_at: _ca,
          ...columns
        } = updates as Record<string, unknown> & Partial<Order>;

        const { error: e } = await supabase
          .from("orders")
          .update(columns)
          .eq("id", orderId);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, refresh, guard]
  );

  const submitDraft = useCallback(
    async (orderId: string) =>
      guard(async () => {
        const { error: e } = await supabase.rpc("submit_order", { p_order_id: orderId });
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, refresh, guard]
  );

  const deleteOrder = useCallback(
    async (orderId: string) =>
      guard(async () => {
        const { error: e } = await supabase.from("orders").delete().eq("id", orderId);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, refresh, guard]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string) =>
      guard(async () => {
        const order = orders.find((o) => o.id === orderId);

        // Optimistic: a status change is the most visible action in the app, and
        // waiting on the write plus a full refetch makes the button feel broken.
        // On success the refresh() below reconciles; on failure guard() re-reads
        // the workspace, which discards this.
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
          )
        );

        const { error: e } = await supabase
          .from("orders")
          .update({ status })
          .eq("id", orderId);
        if (e) throw new Error(e.message);

        if (status === "approved" || status === "revision_requested") {
          const type = status === "approved" ? "order_approved" : "revision_requested";

          await supabase.from("activities").insert({
            org_id: organization.id,
            order_id: orderId,
            actor_type: "client",
            actor_id: currentUser.id || null,
            actor_name: currentUser.full_name,
            type,
            payload: note ? { note } : {},
          });

          if (status === "revision_requested") {
            await supabase.from("revisions").insert({
              order_id: orderId,
              requested_by: currentUser.id || null,
              notes: note ?? "",
            });
          }

          if (prefsRef.current.inAppStatus) {
            await supabase.from("notifications").insert({
              user_id: currentUser.id,
              org_id: organization.id,
              order_id: orderId,
              title: status === "approved" ? "Order approved" : "Revision requested",
              message:
                status === "approved"
                  ? `You approved '${order?.title ?? "an order"}'. Final assets are ready to download.`
                  : `Your revision notes for '${order?.title ?? "an order"}' were sent to the writer.`,
              type: "status",
            });
          }
        }

        await refresh();
      }),
    [supabase, orders, organization.id, currentUser, refresh, guard]
  );

  const addComment = useCallback(
    async (
      orderId: string,
      body: string,
      authorType: "client" | "writer" | "system" = "client"
    ) =>
      guard(async () => {
        // Optimistic append so the thread updates as you hit Send. The temporary
        // id is replaced by the real row on the next refresh.
        const optimistic: Comment = {
          id: `pending-${Date.now()}`,
          order_id: orderId,
          author_type: authorType,
          author_id: authorType === "client" ? currentUser.id : undefined,
          author_name: authorType === "client" ? currentUser.full_name : undefined,
          author_avatar: authorType === "client" ? currentUser.avatar_url : undefined,
          body,
          created_at: new Date().toISOString(),
        };
        setCommentsMap((prev) => ({
          ...prev,
          [orderId]: [...(prev[orderId] || []), optimistic],
        }));

        const { error: e } = await supabase.from("comments").insert({
          order_id: orderId,
          author_type: authorType,
          author_id: authorType === "client" ? currentUser.id || null : null,
          body,
        });
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, currentUser.id, currentUser.full_name, currentUser.avatar_url, refresh, guard]
  );

  /* ------------------------------------------------------ notifications */

  const markNotificationsAsRead = useCallback(
    async () =>
      guard(async () => {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: n.read_at ?? now }))
        );
        const { error: e } = await supabase
          .from("notifications")
          .update({ read_at: now })
          .eq("user_id", currentUser.id)
          .is("read_at", null);
        if (e) throw new Error(e.message);
      }),
    [supabase, currentUser.id, guard]
  );

  const markNotificationAsRead = useCallback(
    async (notificationId: string) =>
      guard(async () => {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read_at: n.read_at ?? now } : n))
        );
        const { error: e } = await supabase
          .from("notifications")
          .update({ read_at: now })
          .eq("id", notificationId);
        if (e) throw new Error(e.message);
      }),
    [supabase, guard]
  );

  /* ------------------------------------------------------------ settings */

  const updateCurrentUser = useCallback(
    async (updates: Partial<Profile>) =>
      guard(async () => {
        setCurrentUser((prev) => ({ ...prev, ...updates }));
        const { error: e } = await supabase
          .from("profiles")
          .update({
            full_name: updates.full_name,
            email: updates.email,
            role_title: updates.role_title,
            timezone: updates.timezone,
            avatar_url: updates.avatar_url,
          })
          .eq("id", currentUser.id);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, currentUser.id, refresh, guard]
  );

  const updateOrganization = useCallback(
    async (updates: Partial<Organization>) =>
      guard(async () => {
        setOrganization((prev) => ({ ...prev, ...updates }));
        const { error: e } = await supabase
          .from("organizations")
          .update({
            name: updates.name,
            slug: updates.slug,
            brand_voice: updates.brand_voice,
            brand_domain: updates.brand_domain,
            style_guide_url: updates.style_guide_url,
          })
          .eq("id", organization.id);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, organization.id, refresh, guard]
  );

  const updateBrandVoice = useCallback(
    async (updates: Partial<BrandVoice>) =>
      guard(async () => {
        setBrandVoice((prev) => ({ ...prev, ...updates }));
        const { error: e } = await supabase
          .from("organizations")
          .update({
            brand_voice: updates.summary,
            formality_level: updates.formality_level,
            technical_depth: updates.technical_depth,
            forbidden_words: updates.forbidden_words,
          })
          .eq("id", organization.id);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, organization.id, refresh, guard]
  );

  const updateNotificationPrefs = useCallback(
    async (updates: Partial<NotificationPreferences>) =>
      guard(async () => {
        const next = { ...prefsRef.current, ...updates };
        setNotificationPrefs(next);
        const { error: e } = await supabase.from("notification_preferences").upsert({
          user_id: currentUser.id,
          email_deliverable: next.emailDeliverable,
          email_revision: next.emailRevision,
          email_comment: next.emailComment,
          email_weekly_digest: next.emailWeeklyDigest,
          in_app_status: next.inAppStatus,
          in_app_comment: next.inAppComment,
          in_app_deliverable: next.inAppDeliverable,
        });
        if (e) throw new Error(e.message);
      }),
    [supabase, currentUser.id, guard]
  );

  /**
   * Calls seed_demo_data(). Must run from the app rather than the SQL Editor:
   * the function resolves the target org via auth.uid(), which is NULL for the
   * dashboard's privileged SQL role.
   */
  const seedDemoData = useCallback(
    async (): Promise<number> =>
      guard(async () => {
        const { data, error: e } = await supabase.rpc("seed_demo_data");
        if (e) throw new Error(e.message);
        await refresh();
        return (data as number) ?? 0;
      }),
    [supabase, refresh, guard]
  );

  /**
   * Creates an organization and owner membership for a user who has none.
   *
   * The signup page can only do this when signUp() returns a session, which it
   * does not when email confirmation is enabled. Those users arrive here after
   * confirming and signing in, with no org and every RLS policy denying them,
   * so this is the path that actually completes their setup.
   */
  const bootstrapWorkspace = useCallback(
    async (name: string) =>
      guard(async () => {
        const { error: e } = await supabase.rpc("bootstrap_organization", {
          org_name: name,
        });
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, refresh, guard]
  );

  /** Device-local; never hits the database. */
  const updateAppearance = useCallback((updates: Partial<AppearancePreferences>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  }, []);

  /* ---------------------------------------------------------------- team */

  const inviteMember = useCallback(
    async (email: string, role: MemberRole) =>
      guard(async () => {
        const { error: e } = await supabase.from("invitations").insert({
          org_id: organization.id,
          email,
          role,
          invited_by: currentUser.id || null,
        });
        if (e) throw new Error(e.message);

        await supabase.from("activities").insert({
          org_id: organization.id,
          actor_type: "client",
          actor_id: currentUser.id || null,
          actor_name: currentUser.full_name,
          type: "member_invited",
          payload: { email, role },
        });
        await refresh();
      }),
    [supabase, organization.id, currentUser, refresh, guard]
  );

  const revokeInvitation = useCallback(
    async (invitationId: string) =>
      guard(async () => {
        const { error: e } = await supabase
          .from("invitations")
          .delete()
          .eq("id", invitationId);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, refresh, guard]
  );

  const updateMemberRole = useCallback(
    async (membershipId: string, role: MemberRole) =>
      guard(async () => {
        const { error: e } = await supabase
          .from("memberships")
          .update({ role })
          .eq("id", membershipId);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, refresh, guard]
  );

  const removeMember = useCallback(
    async (membershipId: string) =>
      guard(async () => {
        const { error: e } = await supabase
          .from("memberships")
          .delete()
          .eq("id", membershipId);
        if (e) throw new Error(e.message);
        await refresh();
      }),
    [supabase, refresh, guard]
  );

  /**
   * Clears the in-memory workspace. The Supabase session itself is ended by
   * the caller (UserMenu) so the network failure mode stays visible there.
   */
  const signOut = useCallback(() => {
    setOrders([]);
    setOrganization(EMPTY_ORG);
    setActivities([]);
    setNotifications([]);
    setCommentsMap({});
    setCurrentUser(EMPTY_USER);
    setMemberships([]);
    setInvitations([]);
    setBrandVoice(EMPTY_BRAND_VOICE);
    setNotificationPrefs(EMPTY_PREFS);
    setNeedsOnboarding(false);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        orders,
        organization,
        activities,
        notifications,
        commentsMap,
        currentUser,
        memberships,
        invitations,
        brandVoice,
        notificationPrefs,
        appearance,
        isHydrated,
        needsOnboarding,
        error,
        refresh,
        updateCurrentUser,
        createOrder,
        updateOrder,
        submitDraft,
        deleteOrder,
        updateOrderStatus,
        addComment,
        markNotificationsAsRead,
        markNotificationAsRead,
        updateOrganization,
        updateBrandVoice,
        updateNotificationPrefs,
        updateAppearance,
        seedDemoData,
        bootstrapWorkspace,
        inviteMember,
        revokeInvitation,
        updateMemberRole,
        removeMember,
        signOut,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
