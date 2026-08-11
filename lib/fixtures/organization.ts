import {
  Organization,
  Profile,
  Membership,
  Invitation,
  BrandVoice,
  NotificationPreferences,
  AppearancePreferences,
} from "../types";

export const MOCK_ORGANIZATION: Organization = {
  id: "org-acme",
  name: "Acme Cloud Technologies",
  slug: "acme-cloud",
  brand_voice: "Authoritative, developer-friendly, clear, technical without unnecessary jargon. We write for engineers and technical decision-makers.",
  brand_domain: "acmecloud.io",
  style_guide_url: "https://notion.so/acme/content-style-guide-2026",
  plan: "Growth Tier",
  word_credits_total: 25000,
  word_credits_remaining: 18400,
  renewal_date: "2026-09-01",
  created_at: "2026-01-15T08:00:00Z",
};

export const MOCK_CURRENT_USER: Profile = {
  id: "usr-client-1",
  full_name: "Alex Mercer",
  email: "alex@acmecloud.io",
  avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  role_title: "Head of Content & Growth",
  created_at: "2026-01-15T08:30:00Z",
};

export const MOCK_MEMBERSHIPS: Membership[] = [
  {
    id: "mem-1",
    org_id: "org-acme",
    user_id: "usr-client-1",
    role: "owner",
    profile: MOCK_CURRENT_USER,
    created_at: "2026-01-15T08:30:00Z",
  },
  {
    id: "mem-2",
    org_id: "org-acme",
    user_id: "usr-client-2",
    role: "admin",
    profile: {
      id: "usr-client-2",
      full_name: "Samantha Wright",
      email: "samantha@acmecloud.io",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role_title: "Product Marketing Lead",
      created_at: "2026-02-01T10:00:00Z",
    },
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "mem-3",
    org_id: "org-acme",
    user_id: "usr-client-3",
    role: "member",
    profile: {
      id: "usr-client-3",
      full_name: "Jordan Lee",
      email: "jordan@acmecloud.io",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      role_title: "SEO Strategist",
      created_at: "2026-03-10T14:15:00Z",
    },
    created_at: "2026-03-10T14:15:00Z",
  },
];

export const MOCK_BRAND_VOICE: BrandVoice = {
  summary:
    "Authoritative, developer-friendly, clear, technical without unnecessary hype. We write for software engineers, engineering managers, and technical decision-makers.",
  formality_level: 65,
  technical_depth: 85,
  forbidden_words: [
    "synergy",
    "rockstar developer",
    "ninja",
    "revolutionary AI magic",
    "game-changer",
  ],
};

export const MOCK_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailDeliverable: true,
  emailRevision: true,
  emailComment: true,
  emailWeeklyDigest: false,
  inAppStatus: true,
  inAppComment: true,
  inAppDeliverable: true,
};

export const MOCK_APPEARANCE: AppearancePreferences = {
  theme: "light",
  density: "comfortable",
};

export const MOCK_INVITATIONS: Invitation[] = [
  {
    id: "inv-1",
    org_id: "org-acme",
    email: "claire.marketing@acmecloud.io",
    role: "member",
    invited_by: "Alex Mercer",
    token: "inv_tok_991823",
    status: "pending",
    created_at: "2026-08-08T15:30:00Z",
    expires_at: "2026-08-15T15:30:00Z",
  },
  {
    id: "inv-2",
    org_id: "org-acme",
    email: "devrel-team@acmecloud.io",
    role: "member",
    invited_by: "Samantha Wright",
    token: "inv_tok_847120",
    status: "pending",
    created_at: "2026-08-09T11:00:00Z",
    expires_at: "2026-08-16T11:00:00Z",
  },
];
