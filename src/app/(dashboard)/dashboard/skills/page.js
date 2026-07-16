"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card } from "@/shared/components";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import {
  SKILLS_REPO_URL,
  getSkillRawUrl,
} from "@/shared/constants/skills";

const DEFAULT_PACKAGE_STATUSES = {
  core: { exists: false },
  skills: { exists: false },
  workflows: { exists: false },
};

const SYSTEM_PACKAGES = [
  {
    id: "core",
    name: "Core Package",
    description: "The essential AWKit runtime, shared commands, and base configuration.",
    icon: "settings_suggest",
  },
  {
    id: "workflows",
    name: "Workflows Package",
    description: "Reusable orchestration flows for repeatable multi-step agent work.",
    icon: "account_tree",
  },
  {
    id: "skills",
    name: "All Skills Bundle",
    description: "The complete skill library packaged together for offline installation.",
    icon: "folder_zip",
  },
];

function CopyButton({ value, label = "Copy link", size = "sm" }) {
  const { copied, copy } = useCopyToClipboard(2000);

  return (
    <Button
      type="button"
      variant="primary"
      size={size}
      icon={copied ? "check" : "content_copy"}
      onClick={() => copy(value)}
      title={value}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

function DownloadButton({ packageId, disabled, label = "Download ZIP" }) {
  if (disabled) {
    return (
      <Button type="button" variant="secondary" size="sm" icon="download" disabled>
        {label}
      </Button>
    );
  }

  return (
    <a
      href={`/api/v1/awkit/download?package=${packageId}`}
      download
      className="inline-flex h-7 items-center justify-center gap-1.5 rounded-[8px] border border-border px-3 text-xs font-semibold text-text-main transition-all duration-150 hover:border-brand-500/40 hover:bg-surface-2 active:scale-[0.97]"
    >
      <span className="material-symbols-outlined text-[16px]">download</span>
      {label}
    </a>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-main">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">{description}</p>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const entryUrl = getSkillRawUrl("9router");
  const entryPrompt = `Read this skill and use it: ${entryUrl}`;
  const fileInputRefs = useRef({});
  const [packageStatuses, setPackageStatuses] = useState(DEFAULT_PACKAGE_STATUSES);
  const [uploadingPackages, setUploadingPackages] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const fetchPackageStatuses = useCallback(async () => {
    try {
      const response = await fetch("/api/awkit/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load package status");

      const data = await response.json();
      setPackageStatuses({ ...DEFAULT_PACKAGE_STATUSES, ...data.status });
    } catch (error) {
      setUploadErrors((current) => ({
        ...current,
        status: error.message,
      }));
    }
  }, []);

  useEffect(() => {
    fetchPackageStatuses();
  }, [fetchPackageStatuses]);

  const handlePackageUpload = async (packageId, file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setUploadErrors((current) => ({ ...current, [packageId]: "Select a ZIP file." }));
      return;
    }

    setUploadingPackages((current) => ({ ...current, [packageId]: true }));
    setUploadErrors((current) => ({ ...current, [packageId]: null }));

    try {
      const formData = new FormData();
      formData.append("package", packageId);
      formData.append("file", file);

      const response = await fetch("/api/awkit/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || data.message || "Upload failed");
      await fetchPackageStatuses();
    } catch (error) {
      setUploadErrors((current) => ({ ...current, [packageId]: error.message }));
    } finally {
      setUploadingPackages((current) => ({ ...current, [packageId]: false }));
      if (fileInputRefs.current[packageId]) fileInputRefs.current[packageId].value = "";
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-8">
      <Card
        padding="none"
        elev
        className="relative overflow-hidden border-brand-500/25 bg-gradient-to-br from-surface via-surface to-brand-500/10"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md" icon="rocket_launch">Quick Start</Badge>
              <span className="text-xs font-medium text-text-muted">Entry Skill</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-text-main">
              Give your agent the 9router entry point
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Paste the instruction below into your AI client. It will load the entry skill and guide the agent to the right capability.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-[12px] border border-border-subtle bg-bg/80 p-3 backdrop-blur-sm">
              <code className="min-w-0 flex-1 break-all text-xs leading-5 text-text-main">
                {entryPrompt}
              </code>
              <CopyButton value={entryPrompt} label="Copy Link" size="md" />
            </div>
          </div>
          <div className="hidden size-28 items-center justify-center rounded-[28px] border border-brand-500/20 bg-brand-500/10 text-primary md:flex">
            <span className="material-symbols-outlined text-[52px]">extension</span>
          </div>
        </div>
      </Card>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Bundles"
          title="System Packages"
          description="Download curated packages when you need a complete layer of the AWKit system."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {SYSTEM_PACKAGES.map((packageItem) => (
            <Card key={packageItem.id} padding="md" hover className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[23px]">{packageItem.icon}</span>
                </div>
                <Badge
                  variant={packageStatuses[packageItem.id]?.exists ? "success" : "default"}
                  size="sm"
                >
                  {packageStatuses[packageItem.id]?.exists
                    ? `Available (${(packageStatuses[packageItem.id].size / 1024 / 1024).toFixed(2)} MB)`
                    : "Missing"}
                </Badge>
              </div>
              <h3 className="mt-4 font-semibold text-text-main">{packageItem.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-text-muted">
                {packageItem.description}
              </p>
              {packageStatuses[packageItem.id]?.mtime && (
                <p className="mt-3 text-xs text-text-muted">
                  Modified {new Date(packageStatuses[packageItem.id].mtime).toLocaleString()}
                </p>
              )}
              {uploadErrors[packageItem.id] && (
                <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
                  {uploadErrors[packageItem.id]}
                </p>
              )}
              <input
                ref={(element) => {
                  fileInputRefs.current[packageItem.id] = element;
                }}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(event) => handlePackageUpload(packageItem.id, event.target.files?.[0])}
              />
              <div className="mt-5 flex flex-wrap gap-2">
                <DownloadButton
                  packageId={packageItem.id}
                  disabled={!packageStatuses[packageItem.id]?.exists}
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon="upload"
                  loading={Boolean(uploadingPackages[packageItem.id])}
                  disabled={Boolean(uploadingPackages[packageItem.id])}
                  onClick={() => fileInputRefs.current[packageItem.id]?.click()}
                >
                  Upload ZIP
                </Button>
              </div>
            </Card>
          ))}
        </div>
        {uploadErrors.status && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{uploadErrors.status}</p>
        )}
      </section>

      <Card padding="md" className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-text-main">Explore the source library</h2>
          <p className="mt-1 text-xs text-text-muted">Browse documentation, examples, and skill definitions on GitHub.</p>
        </div>
        <a
          href={`${SKILLS_REPO_URL}/tree/master/skills`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          View on GitHub
          <span className="material-symbols-outlined text-[17px]">open_in_new</span>
        </a>
      </Card>
    </div>
  );
}
