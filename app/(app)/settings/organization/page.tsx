"use client";

import React, { useState } from "react";
import { Building2, Globe, Link as LinkIcon, Check } from "lucide-react";
import { useStore } from "@/lib/context/StoreContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/** Slugs feed the workspace URL, so keep them URL-safe. */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function OrganizationSettingsPage() {
  const { isHydrated } = useStore();
  // Remounting on hydration re-seeds the draft state below from the persisted
  // values, which is why this is a key rather than a sync effect.
  return <OrganizationSettingsForm key={isHydrated ? "stored" : "seed"} />;
}

function OrganizationSettingsForm() {
  const { organization: org, updateOrganization } = useStore();
  const [orgName, setOrgName] = useState(org.name);
  const [slug, setSlug] = useState(org.slug);
  const [styleGuideUrl, setStyleGuideUrl] = useState(org.style_guide_url);
  const [brandDomain, setBrandDomain] = useState(org.brand_domain || "acmecloud.io");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slugify(slug) || org.slug;
    setSlug(cleanSlug);
    updateOrganization({
      name: orgName.trim(),
      slug: cleanSlug,
      style_guide_url: styleGuideUrl.trim(),
      brand_domain: brandDomain.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-base font-bold text-neutral-900">Organization Settings</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage company name, workspace identifiers, and default documentation assets.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            leftIcon={<Building2 className="h-4 w-4 text-neutral-400" />}
            required
          />

          <Input
            label="Workspace URL Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText={`app.inkwellcontent.com/org/${slugify(slug) || "your-workspace"}`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Company Website"
            value={brandDomain}
            onChange={(e) => setBrandDomain(e.target.value)}
            leftIcon={<Globe className="h-4 w-4 text-neutral-400" />}
          />

          <Input
            label="Master Style Guide Link (Notion / Google Docs)"
            value={styleGuideUrl}
            onChange={(e) => setStyleGuideUrl(e.target.value)}
            leftIcon={<LinkIcon className="h-4 w-4 text-neutral-400" />}
            helperText="Shared automatically with assigned writers"
          />
        </div>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <Button type="submit" size="md" variant="primary">
            {saved ? "Saved Organization!" : "Save Changes"}
          </Button>

          {saved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="h-4 w-4" /> Organization updated successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
