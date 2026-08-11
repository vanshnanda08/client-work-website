import { Comment, Revision } from "../types";
import { MOCK_WRITERS } from "./writers";

export const MOCK_REVISIONS: Record<string, Revision[]> = {
  "ord-1048": [
    {
      id: "rev-1048-1",
      order_id: "ord-1048",
      deliverable_id: "del-1048-v1",
      requested_by: "usr-client-1",
      requester_name: "Alex Mercer",
      category: "factual",
      notes: "Elena, the draft is great so far! Could you add a comparison benchmark table in Section 3 for FCR and CSAT metrics? Also please expand on the SaaS engineering rollout roadmap in Section 4.",
      status: "addressed",
      created_at: "2026-08-08T10:15:00Z",
    },
  ],
  "ord-1052": [
    {
      id: "rev-1052-1",
      order_id: "ord-1052",
      deliverable_id: "del-1052-v1",
      requested_by: "usr-client-1",
      requester_name: "Alex Mercer",
      category: "tone",
      notes: "The tone in the introductory email feels slightly too formal for our developer audience. Please make it punchier and emphasize the GitHub integration more clearly.",
      status: "open",
      created_at: "2026-08-09T16:20:00Z",
    },
  ],
};

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  "ord-1048": [
    {
      id: "c-1",
      order_id: "ord-1048",
      author_type: "system",
      body: "Order received and assigned to Elena Rostova (Senior Tech Writer).",
      created_at: "2026-08-06T09:30:00Z",
    },
    {
      id: "c-2",
      order_id: "ord-1048",
      author_type: "writer",
      writer_id: "w-1",
      writer: MOCK_WRITERS[0],
      body: "Hi Alex! Excited to dive into this piece. I've reviewed your brief and target keywords. I'll focus heavily on autonomous tool execution vs scripted chatbots. Let me know if there are any specific customer quotes you'd like highlighted.",
      created_at: "2026-08-06T10:45:00Z",
    },
    {
      id: "c-3",
      order_id: "ord-1048",
      author_type: "client",
      author_name: "Alex Mercer",
      author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      body: "Sounds perfect, Elena! You can reference our general Zendesk integration benchmarks from the style guide.",
      created_at: "2026-08-06T11:20:00Z",
    },
    {
      id: "c-4",
      order_id: "ord-1048",
      author_type: "system",
      body: "Deliverable v1 uploaded by Elena Rostova. Agency QA review completed.",
      created_at: "2026-08-07T11:15:00Z",
    },
    {
      id: "c-5",
      order_id: "ord-1048",
      author_type: "writer",
      writer_id: "w-1",
      writer: MOCK_WRITERS[0],
      body: "I've uploaded Deliverable v2 with the complete FCR/CSAT benchmark table and the 4-step SaaS implementation roadmap as requested in your revision feedback. Looking forward to your final review!",
      created_at: "2026-08-09T14:35:00Z",
    },
  ],
  "ord-1053": [
    {
      id: "c-1053-1",
      order_id: "ord-1053",
      author_type: "writer",
      writer_id: "w-2",
      writer: MOCK_WRITERS[1],
      body: "Drafted two distinct headline angles in the hero section to give you options for A/B testing on launch week.",
      created_at: "2026-08-10T08:50:00Z",
    },
  ],
};
