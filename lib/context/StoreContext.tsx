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
import { MOCK_ORDERS } from "@/lib/fixtures/orders";
import {
  MOCK_ORGANIZATION,
  MOCK_CURRENT_USER,
  MOCK_MEMBERSHIPS,
  MOCK_INVITATIONS,
  MOCK_BRAND_VOICE,
  MOCK_NOTIFICATION_PREFERENCES,
  MOCK_APPEARANCE,
} from "@/lib/fixtures/organization";
import { MOCK_ACTIVITIES, MOCK_NOTIFICATIONS } from "@/lib/fixtures/activities";
import { MOCK_COMMENTS } from "@/lib/fixtures/comments";
import { MOCK_WRITERS } from "@/lib/fixtures/writers";

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
  /**
   * False until localStorage has been layered over the seed fixtures. Forms
   * that copy store values into local draft state key off this so they remount
   * with the persisted values once they arrive.
   */
  isHydrated: boolean;

  updateCurrentUser: (updates: Partial<Profile>) => void;
  createOrder: (orderData: NewOrderInput) => string;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  submitDraft: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  addComment: (orderId: string, body: string, authorType?: "client" | "writer" | "system") => void;
  markNotificationsAsRead: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
  updateBrandVoice: (updates: Partial<BrandVoice>) => void;
  updateNotificationPrefs: (updates: Partial<NotificationPreferences>) => void;
  updateAppearance: (updates: Partial<AppearancePreferences>) => void;
  inviteMember: (email: string, role: MemberRole) => void;
  revokeInvitation: (invitationId: string) => void;
  updateMemberRole: (membershipId: string, role: MemberRole) => void;
  removeMember: (membershipId: string) => void;
  signOut: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  orders: "inkwell_orders_v2",
  organization: "inkwell_org_v2",
  notifications: "inkwell_notifs_v2",
  activities: "inkwell_activities_v2",
  comments: "inkwell_comments_v2",
  user: "inkwell_user_v2",
  memberships: "inkwell_memberships_v2",
  invitations: "inkwell_invitations_v2",
  brandVoice: "inkwell_brand_voice_v2",
  notificationPrefs: "inkwell_notif_prefs_v2",
  appearance: "inkwell_appearance_v2",
} as const;

/**
 * Monotonic id suffix so several records created inside the same millisecond
 * (e.g. the two comments written when a revision is requested) never collide.
 */
let idCounter = 0;
const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const readStored = <T,>(key: string): T | undefined => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [organization, setOrganization] = useState<Organization>(MOCK_ORGANIZATION);
  const [activities, setActivities] = useState<ActivityEvent[]>(MOCK_ACTIVITIES);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(MOCK_COMMENTS);
  const [currentUser, setCurrentUser] = useState<Profile>(MOCK_CURRENT_USER);
  const [memberships, setMemberships] = useState<Membership[]>(MOCK_MEMBERSHIPS);
  const [invitations, setInvitations] = useState<Invitation[]>(MOCK_INVITATIONS);
  const [brandVoice, setBrandVoice] = useState<BrandVoice>(MOCK_BRAND_VOICE);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>(MOCK_NOTIFICATION_PREFERENCES);
  const [appearance, setAppearance] = useState<AppearancePreferences>(MOCK_APPEARANCE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on initial client mount. State starts from the
  // fixtures so server and client render identically; stored data is layered on
  // afterwards to avoid a hydration mismatch.
  //
  // The rule below is disabled for this block only: reading the persisted
  // workspace is a one-shot pull from an external system (localStorage) that
  // cannot happen during render without breaking SSR hydration.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedOrders = readStored<Order[]>(STORAGE_KEYS.orders);
    if (Array.isArray(savedOrders) && savedOrders.length > 0) setOrders(savedOrders);

    const savedOrg = readStored<Organization>(STORAGE_KEYS.organization);
    if (savedOrg) setOrganization(savedOrg);

    const savedNotifs = readStored<Notification[]>(STORAGE_KEYS.notifications);
    if (savedNotifs) setNotifications(savedNotifs);

    const savedActivities = readStored<ActivityEvent[]>(STORAGE_KEYS.activities);
    if (savedActivities) setActivities(savedActivities);

    const savedComments = readStored<Record<string, Comment[]>>(STORAGE_KEYS.comments);
    if (savedComments) setCommentsMap(savedComments);

    const savedUser = readStored<Profile>(STORAGE_KEYS.user);
    if (savedUser) setCurrentUser(savedUser);

    const savedMemberships = readStored<Membership[]>(STORAGE_KEYS.memberships);
    if (savedMemberships) setMemberships(savedMemberships);

    const savedInvitations = readStored<Invitation[]>(STORAGE_KEYS.invitations);
    if (savedInvitations) setInvitations(savedInvitations);

    const savedVoice = readStored<BrandVoice>(STORAGE_KEYS.brandVoice);
    if (savedVoice) setBrandVoice(savedVoice);

    const savedPrefs = readStored<NotificationPreferences>(STORAGE_KEYS.notificationPrefs);
    if (savedPrefs) setNotificationPrefs(savedPrefs);

    const savedAppearance = readStored<AppearancePreferences>(STORAGE_KEYS.appearance);
    if (savedAppearance) setAppearance(savedAppearance);

    setIsHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Single write-through sync. Every mutation below uses functional updates, so
  // this effect always observes the final committed state.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.organization, JSON.stringify(organization));
      localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
      localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(commentsMap));
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.memberships, JSON.stringify(memberships));
      localStorage.setItem(STORAGE_KEYS.invitations, JSON.stringify(invitations));
      localStorage.setItem(STORAGE_KEYS.brandVoice, JSON.stringify(brandVoice));
      localStorage.setItem(STORAGE_KEYS.notificationPrefs, JSON.stringify(notificationPrefs));
      localStorage.setItem(STORAGE_KEYS.appearance, JSON.stringify(appearance));
    } catch (e) {
      console.warn("Failed to sync store to localStorage", e);
    }
  }, [
    orders,
    organization,
    notifications,
    activities,
    commentsMap,
    currentUser,
    memberships,
    invitations,
    brandVoice,
    notificationPrefs,
    appearance,
    isHydrated,
  ]);

  const pushActivity = useCallback((event: Omit<ActivityEvent, "id">) => {
    setActivities((prev) => [{ ...event, id: uid("act") }, ...prev]);
  }, []);

  /**
   * In-app notifications are gated on the user's notification preferences. The
   * prefs are read through a ref so this callback stays stable and never has to
   * mutate one piece of state from inside another's updater.
   */
  const notificationPrefsRef = useRef(notificationPrefs);
  useEffect(() => {
    notificationPrefsRef.current = notificationPrefs;
  }, [notificationPrefs]);

  const pushNotification = useCallback(
    (notification: Omit<Notification, "id" | "user_id" | "read_at">) => {
      const prefs = notificationPrefsRef.current;
      const allowed =
        notification.type === "deliverable"
          ? prefs.inAppDeliverable
          : notification.type === "comment"
          ? prefs.inAppComment
          : prefs.inAppStatus;
      if (!allowed) return;

      setNotifications((prev) => [
        { ...notification, id: uid("notif"), user_id: currentUser.id, read_at: null },
        ...prev,
      ]);
    },
    [currentUser.id]
  );

  const createOrder = useCallback(
    (data: NewOrderInput): string => {
      const isDraft = data.status === "draft";
      const now = new Date().toISOString();
      const wordTarget = Number(data.word_count_target) || 1200;

      // Derive the next human-readable order number from the highest existing one
      // so ids stay unique even after deletions.
      const highest = orders.reduce((max, o) => {
        const n = parseInt(o.id.replace(/\D/g, ""), 10);
        return Number.isFinite(n) && n > max ? n : max;
      }, 1050);
      const newId = `ord-${highest + 1}`;

      const assignedWriter = isDraft ? undefined : MOCK_WRITERS[0];

      const newOrder: Order = {
        id: newId,
        org_id: organization.id,
        created_by: currentUser.id,
        title: data.title,
        content_type: data.content_type,
        word_count_target: wordTarget,
        primary_keyword: data.primary_keyword || "",
        secondary_keywords: data.secondary_keywords || [],
        brief: data.brief,
        tone: data.tone || "Authoritative, Clear & Engaging",
        target_audience: data.target_audience || "B2B Tech Buyers",
        reference_urls: data.reference_urls || [],
        due_date: data.due_date,
        priority: data.priority || "standard",
        status: isDraft ? "draft" : "submitted",
        assigned_writer_id: assignedWriter?.id,
        assigned_writer: assignedWriter,
        deliverables: [],
        comments_count: isDraft ? 0 : 1,
        outline_required: true,
        plagiarism_check: true,
        meta_description_required: true,
        created_at: now,
        updated_at: now,
      };

      setOrders((prev) => [newOrder, ...prev]);

      if (!isDraft) {
        setOrganization((prev) => ({
          ...prev,
          word_credits_remaining: Math.max(0, prev.word_credits_remaining - wordTarget),
        }));

        pushActivity({
          org_id: organization.id,
          order_id: newId,
          order_title: data.title,
          actor_type: "client",
          actor_name: currentUser.full_name,
          type: "order_created",
          payload: { words: wordTarget },
          created_at: now,
        });

        pushNotification({
          event_id: newId,
          title: "Order Submitted to Queue",
          message: `Order '${data.title}' was submitted and assigned to ${assignedWriter?.full_name}.`,
          order_id: newId,
          created_at: now,
          type: "status",
        });

        setCommentsMap((prev) => ({
          ...prev,
          [newId]: [
            {
              id: uid("c-sys"),
              order_id: newId,
              author_type: "system",
              body: `Order submitted to production. Assigned to ${
                assignedWriter?.full_name || "Agency Editorial Team"
              }.`,
              created_at: now,
            },
          ],
        }));
      }

      return newId;
    },
    [orders, organization.id, currentUser, pushActivity, pushNotification]
  );

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) =>
        o.id.toLowerCase() === orderId.toLowerCase()
          ? { ...o, ...updates, updated_at: now }
          : o
      )
    );
  }, []);

  /** Moves a saved draft into production: assigns a writer and spends credits. */
  const submitDraft = useCallback(
    (orderId: string) => {
      const now = new Date().toISOString();
      const draft = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (!draft || draft.status !== "draft") return;

      const assignedWriter = MOCK_WRITERS[0];

      setOrders((prev) =>
        prev.map((o) =>
          o.id.toLowerCase() === orderId.toLowerCase()
            ? {
                ...o,
                status: "submitted" as OrderStatus,
                assigned_writer_id: assignedWriter.id,
                assigned_writer: assignedWriter,
                comments_count: (o.comments_count || 0) + 1,
                updated_at: now,
              }
            : o
        )
      );

      setOrganization((prev) => ({
        ...prev,
        word_credits_remaining: Math.max(
          0,
          prev.word_credits_remaining - draft.word_count_target
        ),
      }));

      pushActivity({
        org_id: organization.id,
        order_id: draft.id,
        order_title: draft.title,
        actor_type: "client",
        actor_name: currentUser.full_name,
        type: "order_created",
        payload: { words: draft.word_count_target },
        created_at: now,
      });

      pushNotification({
        event_id: draft.id,
        title: "Draft Submitted to Queue",
        message: `Order '${draft.title}' was submitted and assigned to ${assignedWriter.full_name}.`,
        order_id: draft.id,
        created_at: now,
        type: "status",
      });

      setCommentsMap((prev) => ({
        ...prev,
        [draft.id]: [
          ...(prev[draft.id] || []),
          {
            id: uid("c-sys"),
            order_id: draft.id,
            author_type: "system",
            body: `Order submitted to production. Assigned to ${assignedWriter.full_name}.`,
            created_at: now,
          },
        ],
      }));
    },
    [orders, organization.id, currentUser.full_name, pushActivity, pushNotification]
  );

  /** Drafts can be discarded outright; submitted work refunds its word credits. */
  const deleteOrder = useCallback(
    (orderId: string) => {
      const target = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (!target) return;

      setOrders((prev) => prev.filter((o) => o.id.toLowerCase() !== orderId.toLowerCase()));

      if (target.status !== "draft") {
        setOrganization((org) => ({
          ...org,
          word_credits_remaining: Math.min(
            org.word_credits_total,
            org.word_credits_remaining + target.word_count_target
          ),
        }));
      }

      setCommentsMap((prev) => {
        const next = { ...prev };
        delete next[target.id];
        return next;
      });

      setNotifications((prev) => prev.filter((n) => n.order_id !== target.id));
    },
    [orders]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, note?: string) => {
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) =>
          o.id.toLowerCase() === orderId.toLowerCase()
            ? { ...o, status, updated_at: now }
            : o
        )
      );

      const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());

      if (status === "approved") {
        pushActivity({
          org_id: organization.id,
          order_id: orderId,
          order_title: order?.title,
          actor_type: "client",
          actor_name: currentUser.full_name,
          type: "order_approved",
          payload: {},
          created_at: now,
        });
        pushNotification({
          event_id: orderId,
          title: "Order Approved",
          message: `You approved '${order?.title ?? orderId}'. Final assets are ready to download.`,
          order_id: orderId,
          created_at: now,
          type: "status",
        });
      } else if (status === "revision_requested") {
        pushActivity({
          org_id: organization.id,
          order_id: orderId,
          order_title: order?.title,
          actor_type: "client",
          actor_name: currentUser.full_name,
          type: "revision_requested",
          payload: { note },
          created_at: now,
        });
        pushNotification({
          event_id: orderId,
          title: "Revision Requested",
          message: `Your revision notes for '${order?.title ?? orderId}' were sent to the writer.`,
          order_id: orderId,
          created_at: now,
          type: "status",
        });
      }
    },
    [orders, organization.id, currentUser.full_name, pushActivity, pushNotification]
  );

  const addComment = useCallback(
    (orderId: string, body: string, authorType: "client" | "writer" | "system" = "client") => {
      const now = new Date().toISOString();
      const newComment: Comment = {
        id: uid("c"),
        order_id: orderId,
        author_type: authorType,
        author_name: authorType === "client" ? currentUser.full_name : undefined,
        author_avatar: authorType === "client" ? currentUser.avatar_url : undefined,
        body,
        created_at: now,
      };

      setCommentsMap((prev) => ({
        ...prev,
        [orderId]: [...(prev[orderId] || []), newComment],
      }));

      setOrders((prev) =>
        prev.map((o) =>
          o.id.toLowerCase() === orderId.toLowerCase()
            ? { ...o, comments_count: (o.comments_count || 0) + 1, updated_at: now }
            : o
        )
      );
    },
    [currentUser.full_name, currentUser.avatar_url]
  );

  const markNotificationsAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read_at: n.read_at ?? now } : n))
    );
  }, []);

  const updateCurrentUser = useCallback(
    (updates: Partial<Profile>) => {
      const next = { ...currentUser, ...updates };
      setCurrentUser(next);
      // Keep the team roster in sync with the signed-in user's own profile.
      setMemberships((members) =>
        members.map((m) => (m.user_id === next.id ? { ...m, profile: next } : m))
      );
    },
    [currentUser]
  );

  const updateOrganization = useCallback((updates: Partial<Organization>) => {
    setOrganization((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateBrandVoice = useCallback((updates: Partial<BrandVoice>) => {
    setBrandVoice((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateNotificationPrefs = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setNotificationPrefs((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateAppearance = useCallback((updates: Partial<AppearancePreferences>) => {
    setAppearance((prev) => ({ ...prev, ...updates }));
  }, []);

  const inviteMember = useCallback(
    (email: string, role: MemberRole) => {
      const now = Date.now();
      setInvitations((prev) => [
        {
          id: uid("inv"),
          org_id: organization.id,
          email,
          role,
          invited_by: currentUser.full_name,
          token: uid("tok"),
          status: "pending",
          created_at: new Date(now).toISOString(),
          expires_at: new Date(now + 7 * 86400000).toISOString(),
        },
        ...prev,
      ]);

      pushActivity({
        org_id: organization.id,
        actor_type: "client",
        actor_name: currentUser.full_name,
        type: "member_invited",
        payload: { email, role },
        created_at: new Date(now).toISOString(),
      });
    },
    [organization.id, currentUser.full_name, pushActivity]
  );

  const revokeInvitation = useCallback((invitationId: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
  }, []);

  const updateMemberRole = useCallback((membershipId: string, role: MemberRole) => {
    setMemberships((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, role } : m))
    );
  }, []);

  const removeMember = useCallback((membershipId: string) => {
    setMemberships((prev) => prev.filter((m) => m.id !== membershipId));
  }, []);

  /** Clears the locally persisted workspace and returns to the seeded fixtures. */
  const signOut = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn("Failed to clear stored session", e);
    }
    setOrders(MOCK_ORDERS);
    setOrganization(MOCK_ORGANIZATION);
    setActivities(MOCK_ACTIVITIES);
    setNotifications(MOCK_NOTIFICATIONS);
    setCommentsMap(MOCK_COMMENTS);
    setCurrentUser(MOCK_CURRENT_USER);
    setMemberships(MOCK_MEMBERSHIPS);
    setInvitations(MOCK_INVITATIONS);
    setBrandVoice(MOCK_BRAND_VOICE);
    setNotificationPrefs(MOCK_NOTIFICATION_PREFERENCES);
    setAppearance(MOCK_APPEARANCE);
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
