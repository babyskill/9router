"use client";

import { Badge, Button, Card } from "@/shared/components";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import {
  SKILLS,
  SKILLS_REPO_URL,
  getSkillBlobUrl,
  getSkillRawUrl,
} from "@/shared/constants/skills";

const SYSTEM_PACKAGES = [
  {
    id: "core",
    name: "Core Package",
    description: "The essential AWKit runtime, shared commands, and base configuration.",
    icon: "settings_suggest",
  },
  {
    id: "workflow",
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

function DownloadButton({ packageId, label = "Download ZIP" }) {
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

function SectionHeading({ eyebrow, title, description, count }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-main">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">{description}</p>
      </div>
      {count !== undefined && (
        <Badge variant="default" size="md">
          {count} available
        </Badge>
      )}
    </div>
  );
}

function SkillCard({ skill }) {
  const rawUrl = getSkillRawUrl(skill.id);

  return (
    <Card
      padding="none"
      className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-[var(--shadow-warm)]"
    >
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[21px]">{skill.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-text-main">{skill.name}</h3>
                {skill.isEntry && (
                  <Badge variant="primary" size="sm">Entry</Badge>
                )}
              </div>
              {skill.endpoint && (
                <Badge variant="default" size="sm" className="mt-2 max-w-full">
                  <code className="truncate text-[10px]">{skill.endpoint}</code>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-6 text-text-muted">{skill.description}</p>

        <a
          href={getSkillBlobUrl(skill.id)}
          target="_blank"
          rel="noreferrer"
          title={rawUrl}
          className="mt-4 flex items-center gap-2 rounded-[10px] border border-border-subtle bg-bg px-3 py-2 font-mono text-[11px] text-text-muted transition-colors hover:border-brand-500/30 hover:text-primary"
        >
          <span className="min-w-0 flex-1 truncate">{rawUrl}</span>
          <span className="material-symbols-outlined shrink-0 text-[15px]">open_in_new</span>
        </a>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <CopyButton value={rawUrl} />
          <DownloadButton packageId={skill.id} />
        </div>
      </div>
    </Card>
  );
}

export default function SkillsPage() {
  const entryUrl = getSkillRawUrl("9router");
  const entryPrompt = `Read this skill and use it: ${entryUrl}`;

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
              <div className="flex size-11 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[23px]">{packageItem.icon}</span>
              </div>
              <h3 className="mt-4 font-semibold text-text-main">{packageItem.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-text-muted">
                {packageItem.description}
              </p>
              <div className="mt-5">
                <DownloadButton packageId={packageItem.id} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Library"
          title="Individual Capabilities & Skills"
          description="Manage, share, or download each capability independently without pulling the full skills bundle."
          count={SKILLS.length}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {SKILLS.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
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
