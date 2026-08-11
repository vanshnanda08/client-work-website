import { OrderStatus, ContentType, Priority } from "./types";

export const APP_CONFIG = {
  name: "Inkwell",
  tagline: "Premium Content Writing for Modern Teams",
  description: "Order high-impact written content, track pipeline status in real time, and collaborate seamlessly with expert writers.",
  placeholderBrand: "Inkwell",
  supportEmail: "support@inkwellcontent.com",
};

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    bgLight: string;
    textDark: string;
    dotColor: string;
    stepIndex: number;
  }
> = {
  draft: {
    label: "Draft",
    description: "Order saved as draft and not yet submitted to queue",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    bgLight: "bg-slate-50",
    textDark: "text-slate-800",
    dotColor: "bg-slate-400",
    stepIndex: 0,
  },
  submitted: {
    label: "Submitted",
    description: "Received by agency team, awaiting queue assignment",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    bgLight: "bg-blue-50/50",
    textDark: "text-blue-900",
    dotColor: "bg-blue-500",
    stepIndex: 1,
  },
  in_queue: {
    label: "In Queue",
    description: "Brief reviewed, matching with a specialized writer",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    bgLight: "bg-indigo-50/50",
    textDark: "text-indigo-900",
    dotColor: "bg-indigo-500",
    stepIndex: 2,
  },
  writing: {
    label: "Writing",
    description: "Assigned writer is drafting your content deliverable",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    bgLight: "bg-purple-50/50",
    textDark: "text-purple-900",
    dotColor: "bg-purple-500",
    stepIndex: 3,
  },
  in_review: {
    label: "In QA Review",
    description: "Internal editor reviewing deliverable against brief & style guide",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    bgLight: "bg-amber-50/50",
    textDark: "text-amber-900",
    dotColor: "bg-amber-500",
    stepIndex: 4,
  },
  delivered: {
    label: "Ready for Review",
    description: "Deliverable uploaded! Awaiting your review & approval",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20 animate-pulse-subtle",
    bgLight: "bg-emerald-50/60",
    textDark: "text-emerald-950",
    dotColor: "bg-emerald-500",
    stepIndex: 5,
  },
  revision_requested: {
    label: "Revision In Progress",
    description: "Writer is applying your requested edits and revisions",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    bgLight: "bg-rose-50/50",
    textDark: "text-rose-900",
    dotColor: "bg-rose-500",
    stepIndex: 3,
  },
  approved: {
    label: "Approved & Completed",
    description: "Content approved and finalized for publishing",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    bgLight: "bg-teal-50/50",
    textDark: "text-teal-950",
    dotColor: "bg-teal-600",
    stepIndex: 6,
  },
};

export const CONTENT_TYPES: Record<
  ContentType,
  {
    label: string;
    description: string;
    defaultWordCount: number;
    icon: string;
  }
> = {
  blog_post: {
    label: "Blog Post",
    description: "Engaging top-of-funnel articles & company announcements",
    defaultWordCount: 1200,
    icon: "FileText",
  },
  seo_article: {
    label: "SEO Pillar Article",
    description: "Deep, search-optimized comprehensive guides designed to rank",
    defaultWordCount: 2000,
    icon: "Search",
  },
  landing_page: {
    label: "Landing Page Copy",
    description: "High-converting hero copy, feature sections & value props",
    defaultWordCount: 800,
    icon: "Layout",
  },
  email_sequence: {
    label: "Email Sequence",
    description: "Multi-touch onboarding, nurture, or sales drip emails",
    defaultWordCount: 1500,
    icon: "Mail",
  },
  case_study: {
    label: "Customer Case Study",
    description: "Data-driven customer success stories with metrics & quotes",
    defaultWordCount: 1400,
    icon: "Award",
  },
  whitepaper: {
    label: "Whitepaper / Ebook",
    description: "Authoritative lead magnets with research and industry insights",
    defaultWordCount: 3500,
    icon: "BookOpen",
  },
  press_release: {
    label: "Press Release",
    description: "Standard AP style announcements for news and distribution",
    defaultWordCount: 600,
    icon: "Megaphone",
  },
  other: {
    label: "Custom Deliverable",
    description: "Custom written content tailored to unique format briefs",
    defaultWordCount: 1000,
    icon: "Sparkles",
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    color: string;
    badgeClass: string;
  }
> = {
  standard: {
    label: "Standard",
    color: "text-slate-600",
    badgeClass: "bg-slate-100 text-slate-700",
  },
  high: {
    label: "High Priority",
    color: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  urgent: {
    label: "Urgent Rush",
    color: "text-rose-600",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
  },
};
