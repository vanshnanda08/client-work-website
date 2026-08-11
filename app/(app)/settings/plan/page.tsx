"use client";

import React from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { APP_CONFIG } from "@/lib/config";
import { formatDate, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function PlanSettingsPage() {
  const { organization: org, orders, currentUser } = useStore();
  const usedWords = Math.max(0, org.word_credits_total - org.word_credits_remaining);
  const percentage = org.word_credits_total
    ? Math.round((usedWords / org.word_credits_total) * 100)
    : 0;

  const activeOrders = orders.filter(
    (o) => !["draft", "approved"].includes(o.status)
  ).length;

  const tiers = [
    {
      name: "Starter Tier",
      words: "10,000 words/mo",
      price: "$1,490/mo",
      features: [
        "10,000 words of finished content",
        "Dedicated specialized writer",
        "5-7 day standard turnaround",
        "Editor QA & Plagiarism scan",
      ],
    },
    {
      name: "Growth Tier",
      words: "25,000 words/mo",
      price: "$3,250/mo",
      features: [
        "25,000 words of finished content",
        "Senior tech writers & strategists",
        "3-4 day fast turnaround",
        "Unlimited minor revisions",
        "SEO keyword clustering & briefs",
      ],
    },
    {
      name: "Scale Tier",
      words: "60,000 words/mo",
      price: "$6,900/mo",
      features: [
        "60,000 words of finished content",
        "Dedicated editorial squad",
        "48-hour urgent rush available",
        "Custom style guide engineering",
        "Direct Slack channel access",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Usage Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                Active Subscription
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-neutral-900 mt-1">{org.plan}</h2>
            <p className="text-xs text-neutral-500">
              Next monthly credit allocation renews on {formatDate(org.renewal_date)}
            </p>
          </div>

          <a
            href={`mailto:${APP_CONFIG.supportEmail}?subject=${encodeURIComponent(
              `Account question from ${org.name}`
            )}`}
          >
            <Button size="sm" variant="outline" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              Contact Account Lead
            </Button>
          </a>
        </div>

        {/* Word Credit Gauge */}
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/60 space-y-3">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-neutral-700">
              <strong className="text-base font-extrabold text-neutral-900">
                {formatNumber(org.word_credits_remaining)}
              </strong>{" "}
              words remaining
            </span>
            <span className="text-neutral-500">
              {formatNumber(usedWords)} / {formatNumber(org.word_credits_total)} used ({percentage}%)
            </span>
          </div>

          <div className="w-full bg-neutral-200/70 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-neutral-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400 pt-1">
            <span>Unused word credits rollover automatically (up to 50k max)</span>
            <span>
              {activeOrders} order{activeOrders === 1 ? "" : "s"} currently in production • Billing
              cycle: Monthly
            </span>
          </div>
        </div>
      </div>

      {/* Available Plans Overview (Display-only per decision #1) */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Agency Plans & Capacity</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Need more monthly content capacity? Contact your agency representative to upgrade your tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => {
            const isCurrent = tier.name === org.plan;
            return (
            <div
              key={tier.name}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${
                isCurrent
                  ? "border-neutral-900 bg-neutral-900/5 ring-2 ring-neutral-900"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900">{tier.name}</h4>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                      Current
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xl font-extrabold text-neutral-900">
                  {tier.price}
                </div>
                <div className="text-xs text-neutral-500 font-medium">{tier.words}</div>

                <ul className="mt-4 space-y-2 text-xs text-neutral-600">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100">
                {isCurrent ? (
                  <Button variant="secondary" size="sm" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <a
                    href={`mailto:${APP_CONFIG.supportEmail}?subject=${encodeURIComponent(
                      `Plan change request: ${org.name} → ${tier.name}`
                    )}&body=${encodeURIComponent(
                      `Hi,\n\nWe'd like to move ${org.name} from the ${org.plan} to the ${tier.name} (${tier.words}).\n\nThanks,\n${currentUser.full_name}`
                    )}`}
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Upgrade Tier
                    </Button>
                  </a>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
