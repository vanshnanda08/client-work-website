import { Deliverable } from "../types";

export const MOCK_DELIVERABLES: Record<string, Deliverable[]> = {
  // Order ORD-1048 (Delivered & ready for review - has v1 and updated v2)
  "ord-1048": [
    {
      id: "del-1048-v2",
      order_id: "ord-1048",
      version: 2,
      word_count: 2150,
      submitted_at: "2026-08-09T14:30:00Z",
      created_at: "2026-08-09T14:30:00Z",
      file_name: "AI-Agents-Customer-Support-Guide-v2.docx",
      file_size: "142 KB",
      google_doc_url: "https://docs.google.com/document/d/sample-doc-1048",
      body_md: `# The Modern Guide to Autonomous AI Agents in Enterprise Customer Support (2026 Edition)

> **Executive Summary:** As modern support queues scale linearly with user growth, Tier-1 ticket volume threatens response times and burns out human agents. Autonomous AI agents have shifted from rigid decision-tree chatbots into contextual LLM-powered resolution engines capable of solving 68% of Tier-1 issues with zero human escalation.

---

## 1. The Paradigm Shift: From Scripted Bots to Autonomous Resolvers

For over a decade, customer support "chatbots" were synonymous with frustration. Rule-based bots failed whenever a customer's inquiry diverged by even a single keyword from the pre-programmed flowchart.

The next generation of **autonomous AI agents** operates fundamentally differently:

- **Dynamic Context Parsing:** Rather than keyword matching, agents synthesize conversational intent, account subscription tiers, and historical ticket data.
- **Bi-directional Tool Execution:** Agents do not merely output canned responses—they trigger API actions (e.g., issuing refunds under \$50, resetting API keys, extending trial periods).
- **Graceful Escalation with Context Dossiers:** When human intervention is required, the AI compiles a 3-bullet summary with sentiment tags, eliminating customer repetition.

\`\`\`
[ Customer Inquiry ] ──▶ [ Context & Policy Engine ] ──▶ [ Action Execution (APIs) ]
                                    │
                                    ▼ (Complex edge case)
                         [ Warm Human Hand-off + Dossier ]
\`\`\`

---

## 2. Key Architectural Components of a Production-Ready Support Agent

To achieve enterprise reliability and prevent hallucination, production implementations rely on a three-tier safety framework:

### A. Grounded Retrieval-Augmented Generation (RAG)
The model must restrict its factual knowledge base strictly to approved documentation, synced in real-time from Notion, Confluence, and Zendesk Help Centers. Vector embeddings ensure semantic similarity without speculative invention.

### B. Guardrailed Action Boundary Policies
Deterministic authorization middleware prevents unauthorized operations. For example:
- *Permitted:* "Update shipping address if order status is Pending"
- *Prohibited:* "Change invoice recipient email without 2FA confirmation"

### C. Human-in-the-Loop Confidence Thresholds
Queries with confidence scores below 0.88 automatically branch into supervisor queues with pre-filled suggested replies for one-click human approval.

---

## 3. Benchmarked Metrics: What to Measure in 2026

When evaluating AI agent performance across your support stack, prioritize the following four KPIs over vanity deflection rates:

| Metric | Legacy Chatbot Benchmark | Autonomous AI Agent (2026) |
|---|---|---|
| **First-Contact Resolution (FCR)** | 22% - 31% | **64% - 78%** |
| **Median Resolution Time** | 4.2 hours | **48 seconds** |
| **Customer Satisfaction (CSAT)** | 3.4 / 5.0 | **4.7 / 5.0** |
| **Human Escalation Quality** | Unstructured transcript dump | Structured summary + triage tags |

---

## 4. Implementation Roadmap for SaaS Engineering Teams

1. **Week 1–2: Knowledge Cleanse & Policy Codification**
   Audit top 200 recurring tickets and establish unambiguous standard operating procedures (SOPs).
2. **Week 3–4: Shadow Mode Evaluation**
   Run the agent silently in the background alongside human reps, scoring draft responses without live customer exposure.
3. **Week 5–6: Canary Deployment on Low-Risk Categories**
   Enable live auto-resolution on password resets, billing FAQ lookups, and account verifications.
4. **Week 7+: Full Multi-Channel Rollout**
   Integrate seamlessly into Slack, In-App Widget, and Email queues with continuous feedback loops.

---

## Conclusion

Autonomous customer support agents are no longer an experimental luxury—they are the foundational infrastructure separating high-velocity SaaS companies from stagnant ticket backlogs. By pairing grounded RAG with strict policy guardrails, teams can scale customer delight without ballooning support headcount.
`,
    },
    {
      id: "del-1048-v1",
      order_id: "ord-1048",
      version: 1,
      word_count: 1890,
      submitted_at: "2026-08-07T11:15:00Z",
      created_at: "2026-08-07T11:15:00Z",
      file_name: "AI-Agents-Customer-Support-Guide-v1.docx",
      file_size: "128 KB",
      body_md: `# Autonomous AI Agents in Enterprise Customer Support (Draft v1)

## Introduction
Modern customer support is evolving rapidly with artificial intelligence. This guide covers how modern companies use AI to handle tickets and streamline team workflows.

## Key Concepts
1. Deflection vs Resolution
2. RAG Architectures
3. Human in the Loop

*(Note: v1 had fewer benchmark stats and lacked the implementation roadmap table)*
`,
    },
  ],

  // Order ORD-1051 (Approved & Completed)
  "ord-1051": [
    {
      id: "del-1051-v1",
      order_id: "ord-1051",
      version: 1,
      word_count: 1420,
      submitted_at: "2026-08-05T09:00:00Z",
      created_at: "2026-08-05T09:00:00Z",
      file_name: "Case-Study-Acme-Pay-Scale.docx",
      file_size: "115 KB",
      google_doc_url: "https://docs.google.com/document/d/sample-doc-1051",
      body_md: `# Case Study: How AcmePay Scaled Cross-Border B2B Invoicing to $12M ARR with Zero Reconciliation Lag

> **Client:** AcmePay Global  
> **Industry:** FinTech / Cross-Border Payments  
> **Key Results:** 84% reduction in manual ledger reconciliation, 3.2x faster invoice processing, 99.98% compliance accuracy across 42 currencies.

---

## The Challenge: Growing Pains at $3M ARR

When AcmePay expanded into European and Southeast Asian corridors, invoice settlement times spiked from hours to an average of 4 business days. Treasury teams spent over 30 hours per week manually matching SWIFT MT103 receipts against client database records.

---

## The Solution: Real-Time Multi-Currency Virtual Accounts

By deploying automated webhook-driven virtual IBANs, AcmePay enabled enterprise clients to fund dedicated currency buckets instantly.

### Core Architectural Highlights
- Sub-second ledger balancing via distributed event streaming.
- Automated FX hedging triggers on volatility spikes >0.75%.
- Embedded tax and VAT compliance checks for EU cross-border transactions.

---

## The Results
- **84% reduction** in manual reconciliation labor.
- **\$12M ARR** achieved within 14 months of global rollout.
- **Zero penalty fees** across multiple regulated jurisdictions.
`,
    },
  ],

  // Order ORD-1053 (Delivered & ready for review)
  "ord-1053": [
    {
      id: "del-1053-v1",
      order_id: "ord-1053",
      version: 1,
      word_count: 910,
      submitted_at: "2026-08-10T08:45:00Z",
      created_at: "2026-08-10T08:45:00Z",
      file_name: "Developer-Tooling-Landing-Page-Copy.docx",
      file_size: "95 KB",
      body_md: `# Landing Page Copy: CloudInfra Observability Engine

## Hero Section
**Headline:** Catch Production Regressions Before Your Pager Goes Off.  
**Sub-headline:** The first distributed tracing platform that automatically correlates database latency spikes with PR commits in under 3 seconds.  
**Primary CTA:** [ Start Free 14-Day Trial ]  
**Secondary CTA:** [ Watch 2-Min Interactive Demo ]  
**Social Proof Banner:** *Trusted by platform engineers at Stripe, Vercel, Supabase, and Datadog.*

---

## Feature Block 1: Zero-Config OpenTelemetry Ingestion
- Auto-instruments Python, Go, Node.js, and Rust runtimes with a single binary.
- Eliminate 90% of boilerplate collector configs.

---

## Feature Block 2: Commit-to-Query Flamegraphs
- Jump directly from a slow p99 trace to the exact Git blame commit line that introduced the N+1 query.
`,
    },
  ],
};
