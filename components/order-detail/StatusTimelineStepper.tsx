import React from "react";
import { Check, Clock, AlertCircle, Sparkles } from "lucide-react";
import { OrderStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

interface StatusTimelineStepperProps {
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const StatusTimelineStepper: React.FC<StatusTimelineStepperProps> = ({
  status,
  createdAt,
  updatedAt,
}) => {
  const steps: { key: OrderStatus; label: string; description: string }[] = [
    { key: "submitted", label: "Submitted", description: "Order received" },
    { key: "in_queue", label: "In Queue", description: "Writer matched" },
    { key: "writing", label: "Writing", description: "Drafting in progress" },
    { key: "in_review", label: "QA Review", description: "Editorial check" },
    { key: "delivered", label: "Delivered", description: "Awaiting your review" },
    { key: "approved", label: "Approved", description: "Ready to publish" },
  ];

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const currentStepIndex = currentConfig.stepIndex;
  const isRevision = status === "revision_requested";

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Production Pipeline Status
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Current Stage: <strong className="text-neutral-900">{currentConfig.label}</strong>
          </p>
        </div>

        {isRevision && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            Revision Loop Active
          </span>
        )}
      </div>

      {/* Stepper Timeline Bar */}
      <div className="relative flex items-center justify-between mt-6 mb-2">
        {/* Background connector line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-200 -z-0" />

        {/* Progress colored fill line */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-900 transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, ((currentStepIndex - 1) / (steps.length - 1)) * 100))}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isPassed = currentStepIndex > idx + 1;
          const isCurrent = currentStepIndex === idx + 1 && !isRevision;
          const isRevisionActive = isRevision && step.key === "writing";

          return (
            <div key={step.key} className="relative flex flex-col items-center group z-10">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2",
                  isPassed
                    ? "bg-neutral-900 border-neutral-900 text-white"
                    : isCurrent
                    ? "bg-white border-neutral-900 text-neutral-900 ring-4 ring-neutral-900/10 shadow-sm"
                    : isRevisionActive
                    ? "bg-rose-500 border-rose-600 text-white ring-4 ring-rose-500/20"
                    : "bg-white border-neutral-300 text-neutral-400"
                )}
              >
                {isPassed ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="text-center mt-2">
                <span
                  className={cn(
                    "text-[11px] font-semibold block",
                    isCurrent || isRevisionActive
                      ? "text-neutral-900 font-bold"
                      : isPassed
                      ? "text-neutral-700"
                      : "text-neutral-400"
                  )}
                >
                  {step.label}
                </span>
                <span className="hidden sm:block text-[10px] text-neutral-400 leading-tight">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
