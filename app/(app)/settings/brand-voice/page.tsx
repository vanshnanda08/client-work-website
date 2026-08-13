"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function BrandVoiceSettingsPage() {
  const { isHydrated } = useStore();
  // Remounting on hydration re-seeds the draft state below from the persisted
  // values, which is why this is a key rather than a sync effect.
  return <BrandVoiceForm key={isHydrated ? "stored" : "seed"} />;
}

function BrandVoiceForm() {
  const { brandVoice, updateBrandVoice } = useStore();

  const [voiceSummary, setVoiceSummary] = useState(brandVoice.summary);
  const [formalityLevel, setFormalityLevel] = useState(brandVoice.formality_level);
  const [technicalDepth, setTechnicalDepth] = useState(brandVoice.technical_depth);
  const [forbiddenWords, setForbiddenWords] = useState<string[]>(brandVoice.forbidden_words);
  const [wordInput, setWordInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleAddWord = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && wordInput.trim()) {
      e.preventDefault();
      if (!forbiddenWords.includes(wordInput.trim())) {
        setForbiddenWords([...forbiddenWords, wordInput.trim()]);
      }
      setWordInput("");
    }
  };

  const handleRemoveWord = (word: string) => {
    setForbiddenWords(forbiddenWords.filter((w) => w !== word));
  };

  /**
   * One awaited write, not two. `updateBrandVoice` already persists `summary`
   * into organizations.brand_voice — the column the brief builder reads — so
   * the extra updateOrganization call that used to follow it was a second
   * concurrent UPDATE against the same row, racing its own refresh() for no
   * gain. Awaiting also keeps "Saved" honest when the write is rejected.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);
    try {
      await updateBrandVoice({
        summary: voiceSummary.trim(),
        formality_level: formalityLevel,
        technical_depth: technicalDepth,
        forbidden_words: forbiddenWords,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-base font-bold text-neutral-900">Brand Voice & Style Rules</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          These guidelines are automatically integrated into all writing briefs and editor QA checklists.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Tone Description */}
        <Textarea
          label="Core Brand Voice Description"
          rows={4}
          value={voiceSummary}
          onChange={(e) => setVoiceSummary(e.target.value)}
          helperText="Summarize your company's tone, pacing, and audience expectations"
          required
        />

        {/* Sliders for Tone Matrix */}
        <div className="space-y-4 pt-4 border-t border-neutral-100">
          <h3 className="text-xs font-bold text-neutral-900">Tone Spectrum Calibration</h3>

          {/* Formality Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">Formality Level</span>
              <span className="font-bold text-neutral-900">
                {formalityLevel < 40 ? "Casual & Conversational" : formalityLevel < 70 ? "Balanced Professional" : "Strictly Formal & Academic"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formalityLevel}
              onChange={(e) => setFormalityLevel(parseInt(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Casual / Chatty</span>
              <span>Executive / Academic</span>
            </div>
          </div>

          {/* Technical Depth Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">Technical Depth</span>
              <span className="font-bold text-neutral-900">
                {technicalDepth < 40 ? "High-level / Non-technical" : technicalDepth < 75 ? "Working Technical" : "Deep Code & Architecture"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={technicalDepth}
              onChange={(e) => setTechnicalDepth(parseInt(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Layman Explanations</span>
              <span>Code Snippets & Architecture</span>
            </div>
          </div>
        </div>

        {/* Forbidden Words / Blacklist */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <div>
            <h3 className="text-xs font-bold text-neutral-900">Forbidden Words & Clichés</h3>
            <p className="text-xs text-neutral-500">
              Our automated QA will flag these words if used in drafts.
            </p>
          </div>

          <input
            type="text"
            placeholder="Add forbidden phrase and press Enter..."
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            onKeyDown={handleAddWord}
            className="w-full h-10 px-3.5 bg-white text-neutral-900 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            {forbiddenWords.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveWord(word)}
                  className="hover:text-rose-900 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-neutral-100 space-y-2">
          {saveError && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {saveError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Button type="submit" size="md" variant="primary" isLoading={isSaving}>
              {saved ? "Saved Brand Voice!" : "Save Guidelines"}
            </Button>

            {saved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> Guidelines updated for all future orders
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
