"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card, ConfirmModal, Drawer, Input, Modal, Pagination } from "@/shared/components";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { SKILLS_REPO_URL } from "@/shared/constants/skills";

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
  const fileInputRefs = useRef({});
  const customSkillInputRef = useRef(null);
  const hasInitializedSkills = useRef(false);
  const [packageStatuses, setPackageStatuses] = useState(DEFAULT_PACKAGE_STATUSES);
  const [uploadingPackages, setUploadingPackages] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [uploadingCustomSkill, setUploadingCustomSkill] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState(null);
  const [customSkillError, setCustomSkillError] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("skills");
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageName, setPackageName] = useState("");
  const [packageDesc, setPackageDesc] = useState("");
  const [packageSkills, setPackageSkills] = useState([]);
  const [packageSkillsSearch, setPackageSkillsSearch] = useState("");
  const [workflows, setWorkflows] = useState([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [packageWorkflows, setPackageWorkflows] = useState([]);
  const [packageWorkflowsSearch, setPackageWorkflowsSearch] = useState("");
  const [savingPackage, setSavingPackage] = useState(false);
  const [packageError, setPackageError] = useState(null);
  const [deletingPackageId, setDeletingPackageId] = useState(null);
  const [pageSize, setPageSize] = useState(9);
  const [editorSkill, setEditorSkill] = useState(null);
  const [skillFiles, setSkillFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingFileContent, setLoadingFileContent] = useState(false);
  const [savingFile, setSavingFile] = useState(false);
  const [editorMessage, setEditorMessage] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [bundleImport, setBundleImport] = useState(null);

  // Auto-adjust page if current page becomes empty due to item deletion or size changes
  useEffect(() => {
    const totalPages = Math.ceil(skills.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [skills.length, pageSize, currentPage]);

  const toggleSkill = (skillId) => {
    setSelectedSkills((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId]
    );
  };

  const customBundleUrl = `/api/v1/awkit/download?package=custom&skills=${encodeURIComponent(selectedSkills.join(","))}`;

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentSkills = skills.slice(indexOfFirstItem, indexOfLastItem);

  const fetchSkills = useCallback(async () => {
    setLoadingSkills(true);

    try {
      const response = await fetch("/api/awkit/custom-skills", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Unable to load skills");

      setSkills(data);
      setSelectedSkills((current) => {
        const availableIds = new Set(data.map((skill) => skill.id));

        if (!hasInitializedSkills.current && current.length === 0) {
          hasInitializedSkills.current = true;
          return data.map((skill) => skill.id);
        }

        return current.filter((id) => availableIds.has(id));
      });
      setCustomSkillError(null);
    } catch (error) {
      setCustomSkillError(error.message);
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  const fetchWorkflows = useCallback(async () => {
    setLoadingWorkflows(true);
    try {
      const res = await fetch("/api/awkit/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data || []);
      }
    } catch (err) {
      console.error("Error fetching workflows:", err);
    } finally {
      setLoadingWorkflows(false);
    }
  }, []);

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

  const fetchPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const response = await fetch("/api/awkit/packages", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load packages");
      setPackages(data);
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  const handleSavePackage = async () => {
    if (!packageName.trim()) return;
    setSavingPackage(true);
    setPackageError(null);

    const payload = {
      name: packageName.trim(),
      description: packageDesc,
      skills: packageSkills,
      workflows: packageWorkflows,
    };

    try {
      let res;
      if (editingPackage) {
        res = await fetch(`/api/awkit/packages?id=${editingPackage.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/awkit/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save package");

      await fetchPackages();
      setShowPackageModal(false);
      setEditingPackage(null);
      setPackageName("");
      setPackageDesc("");
      setPackageSkills([]);
      setPackageSkillsSearch("");
      setPackageWorkflows([]);
      setPackageWorkflowsSearch("");
    } catch (e) {
      setPackageError(e.message);
    } finally {
      setSavingPackage(false);
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      const res = await fetch(`/api/awkit/packages?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete package");
      }
    } catch (e) {
      console.error("Error deleting package:", e);
    } finally {
      setDeletingPackageId(null);
    }
  };

  const openAddPackageModal = () => {
    setEditingPackage(null);
    setPackageName("");
    setPackageDesc("");
    setPackageSkills([]);
    setPackageSkillsSearch("");
    setPackageWorkflows([]);
    setPackageWorkflowsSearch("");
    setPackageError(null);
    setShowPackageModal(true);
  };

  const openEditPackageModal = (pkg) => {
    setEditingPackage(pkg);
    setPackageName(pkg.name);
    setPackageDesc(pkg.description || "");
    setPackageSkills(pkg.skills || []);
    setPackageSkillsSearch("");
    setPackageWorkflows(pkg.workflows || []);
    setPackageWorkflowsSearch("");
    setPackageError(null);
    setShowPackageModal(true);
  };

  useEffect(() => {
    fetchPackageStatuses();
    fetchSkills();
    fetchPackages();
    fetchWorkflows();
  }, [fetchPackageStatuses, fetchSkills, fetchPackages, fetchWorkflows]);

  const handleCustomSkillUpload = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setCustomSkillError("Select a ZIP file.");
      return;
    }

    setUploadingCustomSkill(true);
    setCustomSkillError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/awkit/custom-skills", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Upload failed");

      setSelectedSkills((current) =>
        current.includes(data.id) ? current : [...current, data.id]
      );
      await fetchSkills();
    } catch (error) {
      setCustomSkillError(error.message);
    } finally {
      setUploadingCustomSkill(false);
      if (customSkillInputRef.current) customSkillInputRef.current.value = "";
    }
  };

  const handleDeleteSkill = async (skillId) => {
    setDeletingSkillId(skillId);
    setCustomSkillError(null);

    try {
      const response = await fetch(
        `/api/awkit/custom-skills?id=${encodeURIComponent(skillId)}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Delete failed");

      setSelectedSkills((current) => current.filter((id) => id !== skillId));
      await fetchSkills();
    } catch (error) {
      setCustomSkillError(error.message);
    } finally {
      setDeletingSkillId(null);
    }
  };

  const loadSkillFile = async (skillId, filePath) => {
    setSelectedFile(filePath);
    setLoadingFileContent(true);
    setEditorMessage(null);

    try {
      const response = await fetch(
        `/api/awkit/custom-skills/file-content?id=${encodeURIComponent(skillId)}&path=${encodeURIComponent(filePath)}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load file");
      setFileContent(data.content ?? "");
    } catch (error) {
      setFileContent("");
      setEditorMessage({ type: "error", text: error.message });
    } finally {
      setLoadingFileContent(false);
    }
  };

  const openSkillEditor = async (skill) => {
    setEditorSkill(skill);
    setSkillFiles([]);
    setSelectedFile(null);
    setFileContent("");
    setEditorMessage(null);
    setLoadingFiles(true);

    try {
      const response = await fetch(
        `/api/awkit/custom-skills/files?id=${encodeURIComponent(skill.id)}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load skill files");
      const files = Array.isArray(data) ? data : data.files || [];
      setSkillFiles(files);
      const defaultFile = files.includes("SKILL.md") ? "SKILL.md" : files[0];
      if (defaultFile) await loadSkillFile(skill.id, defaultFile);
    } catch (error) {
      setEditorMessage({ type: "error", text: error.message });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleAddSkillFile = async () => {
    if (!editorSkill || editorSkill.isBuiltIn) return;
    const filePath = window.prompt("Enter a relative file path (for example: references/example.md)");
    if (!filePath) return;

    setEditorMessage(null);
    try {
      const response = await fetch("/api/awkit/custom-skills/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editorSkill.id, path: filePath }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create file");
      setSkillFiles((current) => [...new Set([...current, filePath])].sort());
      await loadSkillFile(editorSkill.id, filePath);
    } catch (error) {
      setEditorMessage({ type: "error", text: error.message });
    }
  };

  const handleDeleteSkillFile = async () => {
    if (!editorSkill || !fileToDelete) return;
    setEditorMessage(null);
    try {
      const response = await fetch(
        `/api/awkit/custom-skills/files?id=${encodeURIComponent(editorSkill.id)}&path=${encodeURIComponent(fileToDelete)}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete file");
      const remainingFiles = skillFiles.filter((filePath) => filePath !== fileToDelete);
      setSkillFiles(remainingFiles);
      if (selectedFile === fileToDelete) {
        const nextFile = remainingFiles.includes("SKILL.md") ? "SKILL.md" : remainingFiles[0];
        if (nextFile) await loadSkillFile(editorSkill.id, nextFile);
        else {
          setSelectedFile(null);
          setFileContent("");
        }
      }
    } catch (error) {
      setEditorMessage({ type: "error", text: error.message });
    } finally {
      setFileToDelete(null);
    }
  };

  const handleSaveSkillFile = async () => {
    if (!editorSkill || !selectedFile || editorSkill.isBuiltIn) return;
    setSavingFile(true);
    setEditorMessage(null);
    try {
      const response = await fetch("/api/awkit/custom-skills/file-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editorSkill.id, path: selectedFile, content: fileContent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save file");
      setEditorMessage({ type: "success", text: "Changes saved." });
      if (selectedFile === "SKILL.md") await fetchSkills();
    } catch (error) {
      setEditorMessage({ type: "error", text: error.message });
    } finally {
      setSavingFile(false);
    }
  };

  const handleExtractBundle = async () => {
    if (!bundleImport?.selectedSkills.length) return;
    setBundleImport((current) => ({ ...current, step: 2, status: "loading", error: null }));
    try {
      const response = await fetch("/api/awkit/custom-skills/extract-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempFileId: bundleImport.tempFileId,
          selectedSkills: bundleImport.selectedSkills,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to import bundle");
      await fetchSkills();
      setBundleImport((current) => ({ ...current, status: "success", result: data }));
    } catch (error) {
      setBundleImport((current) => ({ ...current, status: "error", error: error.message }));
    }
  };

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
      formData.append("file", file);

      if (packageId === "skills") {
        const response = await fetch("/api/awkit/custom-skills/upload-bundle", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to inspect skill bundle");
        const bundleSkills = data.skills || [];
        setBundleImport({
          tempFileId: data.tempFileId,
          skills: bundleSkills,
          selectedSkills: bundleSkills.map((skill) => skill.id),
          step: 1,
          status: "idle",
          error: null,
        });
        return;
      }

      formData.append("package", packageId);

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

      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("skills")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "skills"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-main"
              }`}
            >
              Custom Skills
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "packages"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-main"
              }`}
            >
              Skill Packages
            </button>
          </div>
          {activeTab === "packages" && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon="add"
              onClick={openAddPackageModal}
            >
              Create Package
            </Button>
          )}
        </div>

        {activeTab === "skills" && (
          <Card padding="md">
          <input
            ref={customSkillInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(event) => handleCustomSkillUpload(event.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-dashed border-brand-500/30 bg-brand-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[21px]">upload_file</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">Add a custom skill</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Upload a ZIP archive containing the skill files and SKILL.md metadata.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon="upload"
              loading={uploadingCustomSkill}
              disabled={uploadingCustomSkill}
              onClick={() => customSkillInputRef.current?.click()}
            >
              Upload Skill ZIP
            </Button>
          </div>

          {customSkillError && (
            <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
              {customSkillError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={selectedSkills.length > 0 ? "success" : "default"} size="sm">
                {selectedSkills.length} of {skills.length} selected
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loadingSkills || skills.length === 0}
                onClick={() => setSelectedSkills(skills.map((skill) => skill.id))}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSkills([])}
              >
                Clear All
              </Button>
            </div>
            {selectedSkills.length === 0 ? (
              <Button type="button" variant="secondary" size="sm" icon="download" disabled>
                Download Selected Skills
              </Button>
            ) : (
              <a
                href={customBundleUrl}
                download
                className="inline-flex h-7 items-center justify-center gap-1.5 rounded-[8px] border border-border px-3 text-xs font-semibold text-text-main transition-all duration-150 hover:border-brand-500/40 hover:bg-surface-2 active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download Selected Skills
              </a>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {loadingSkills && skills.length === 0 ? (
              <div className="col-span-full flex items-center justify-center gap-2 py-8 text-sm text-text-muted">
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Loading skills...
              </div>
            ) : skills.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-text-muted">
                No skills are available yet.
              </p>
            ) : currentSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.id);

              return (
                <div
                  key={skill.id}
                  className={`flex items-start gap-3 rounded-[12px] border p-3 transition-all duration-150 ${
                    isSelected
                      ? "border-brand-500/40 bg-brand-500/5"
                      : "border-border hover:border-brand-500/25 hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSkill(skill.id)}
                    className="mt-1 size-4 shrink-0 accent-primary"
                  />
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[19px]">{skill.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-text-main">{skill.name}</p>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={skill.isBuiltIn ? "visibility" : "edit"}
                          onClick={() => openSkillEditor(skill)}
                          title={skill.isBuiltIn ? `View ${skill.name}` : `Edit ${skill.name}`}
                        />
                        {!skill.isBuiltIn && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon="delete"
                            loading={deletingSkillId === skill.id}
                            disabled={deletingSkillId === skill.id}
                            onClick={() => handleDeleteSkill(skill.id)}
                            title={`Delete ${skill.name}`}
                          />
                        )}
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-text-muted">{skill.description}</p>
                    <Badge variant={skill.isBuiltIn ? "primary" : "default"} size="sm" className="mt-2">
                      {skill.isBuiltIn ? "Built-in" : "Custom"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {skills.length > 0 && (
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={skills.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              className="mt-4 border-t border-border/50 pt-4"
            />
          )}
        </Card>
        )}

        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loadingPackages && packages.length === 0 ? (
                <div className="col-span-full flex items-center justify-center gap-2 py-8 text-sm text-text-muted">
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Loading packages...
                </div>
              ) : packages.length === 0 ? (
                <p className="col-span-full py-8 text-center text-sm text-text-muted">
                  No skill packages defined yet. Click "Create Package" to get started.
                </p>
              ) : packages.map((pkg) => (
                <Card key={pkg.id} padding="md" hover className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[20px]">package_2</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="default" size="sm">
                        {pkg.skills?.length || 0} skills
                      </Badge>
                      <Badge variant="success" size="sm">
                        {pkg.workflows?.length || 0} workflows
                      </Badge>
                    </div>
                  </div>
                  <h3 className="mt-4 font-semibold text-text-main">{pkg.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-text-muted">
                    {pkg.description || "No description provided."}
                  </p>
                  
                  {pkg.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {pkg.skills.slice(0, 5).map((skillId) => (
                        <span key={skillId} className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-muted border border-border">
                          {skillId}
                        </span>
                      ))}
                      {pkg.skills.length > 5 && (
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-muted border border-border">
                          +{pkg.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {pkg.workflows?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pkg.workflows.slice(0, 5).map((wfId) => (
                        <span key={wfId} className="rounded bg-brand-500/5 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 text-[10px] border border-brand-500/10">
                          {wfId.split("/").pop()}
                        </span>
                      ))}
                      {pkg.workflows.length > 5 && (
                        <span className="rounded bg-brand-500/5 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 text-[10px] border border-brand-500/10">
                          +{pkg.workflows.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon="edit"
                      onClick={() => openEditPackageModal(pkg)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon="delete"
                      onClick={() => setDeletingPackageId(pkg.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <ConfirmModal
              isOpen={deletingPackageId !== null}
              onClose={() => setDeletingPackageId(null)}
              onConfirm={() => handleDeletePackage(deletingPackageId)}
              title="Delete Skill Package"
              message="Are you sure you want to delete this package? Keys linked to this package will default to downloading all skills."
              confirmText="Delete"
            />
          </div>
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

      <Drawer
        isOpen={Boolean(editorSkill)}
        onClose={() => setEditorSkill(null)}
        title={editorSkill ? `${editorSkill.isBuiltIn ? "View" : "Edit"} ${editorSkill.name}` : ""}
        width="xl"
      >
        {editorSkill && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={editorSkill.isBuiltIn ? "primary" : "default"} size="sm">
                {editorSkill.isBuiltIn ? "Built-in (read-only)" : "Custom"}
              </Badge>
              <span className="text-xs text-text-muted">{editorSkill.id}</span>
            </div>

            {editorMessage && (
              <p
                className={`text-sm font-medium ${
                  editorMessage.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {editorMessage.text}
              </p>
            )}

            <div className="flex gap-4">
              <div className="w-1/3 shrink-0">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Files</p>
                  {!editorSkill.isBuiltIn && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon="add"
                      onClick={handleAddSkillFile}
                      title="Add file"
                    />
                  )}
                </div>
                {loadingFiles ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-text-muted">
                    <span className="material-symbols-outlined animate-spin text-[17px]">progress_activity</span>
                    Loading files...
                  </div>
                ) : skillFiles.length === 0 ? (
                  <p className="py-4 text-sm text-text-muted">No files found.</p>
                ) : (
                  <ul className="space-y-1">
                    {skillFiles.map((filePath) => (
                      <li key={filePath} className="group flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => loadSkillFile(editorSkill.id, filePath)}
                          className={`min-w-0 flex-1 truncate rounded-[8px] px-2.5 py-1.5 text-left text-xs font-medium transition-all duration-150 ${
                            selectedFile === filePath
                              ? "bg-brand-500/10 text-primary"
                              : "text-text-main hover:bg-surface-2"
                          }`}
                          title={filePath}
                        >
                          {filePath}
                        </button>
                        {!editorSkill.isBuiltIn && filePath !== "SKILL.md" && (
                          <button
                            type="button"
                            onClick={() => setFileToDelete(filePath)}
                            className="shrink-0 rounded-[6px] p-1 text-text-muted opacity-0 transition-all duration-150 hover:bg-surface-2 hover:text-red-500 group-hover:opacity-100"
                            title={`Delete ${filePath}`}
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {loadingFileContent ? (
                  <div className="flex h-[450px] items-center justify-center gap-2 rounded-[10px] border border-border text-sm text-text-muted">
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Loading content...
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-3">
                    <textarea
                      value={fileContent}
                      onChange={(event) => setFileContent(event.target.value)}
                      readOnly={editorSkill.isBuiltIn}
                      spellCheck={false}
                      className={`h-[450px] w-full resize-y rounded-[10px] border border-border bg-surface-2 p-3 font-mono text-sm text-text-main outline-none transition-all duration-150 focus:border-brand-500/40 ${
                        editorSkill.isBuiltIn ? "cursor-default opacity-80" : ""
                      }`}
                    />
                    {!editorSkill.isBuiltIn && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          icon="save"
                          loading={savingFile}
                          disabled={savingFile}
                          onClick={handleSaveSkillFile}
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-[450px] items-center justify-center rounded-[10px] border border-border text-sm text-text-muted">
                    Select a file to view its content.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal
        isOpen={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleDeleteSkillFile}
        title="Delete file"
        message={`Delete "${fileToDelete}" from ${editorSkill?.name || "this skill"}? This cannot be undone.`}
        confirmText="Delete"
      />

      <Modal
        isOpen={Boolean(bundleImport)}
        onClose={() => {
          if (bundleImport?.status !== "loading") setBundleImport(null);
        }}
        title="Import Skill Bundle"
        size="lg"
        footer={
          bundleImport?.step === 1 ? (
            <>
              <Button variant="ghost" onClick={() => setBundleImport(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon="unarchive"
                disabled={bundleImport.selectedSkills.length === 0}
                onClick={handleExtractBundle}
              >
                Import Selected ({bundleImport.selectedSkills.length})
              </Button>
            </>
          ) : bundleImport?.status === "loading" ? null : (
            <Button variant="primary" onClick={() => setBundleImport(null)}>
              Close
            </Button>
          )
        }
      >
        {bundleImport?.step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              Choose the skills to extract from the bundle. Conflicting skills will be overwritten.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setBundleImport((current) => ({
                    ...current,
                    selectedSkills: current.skills.map((skill) => skill.id),
                  }))
                }
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setBundleImport((current) => ({ ...current, selectedSkills: [] }))}
              >
                Clear All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setBundleImport((current) => ({
                    ...current,
                    selectedSkills: current.skills
                      .filter((skill) => !skill.exists)
                      .map((skill) => skill.id),
                  }))
                }
              >
                Keep Existing
              </Button>
            </div>
            <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
              {bundleImport.skills.length === 0 ? (
                <p className="py-4 text-center text-sm text-text-muted">
                  No skills were found in this bundle.
                </p>
              ) : (
                bundleImport.skills.map((skill) => {
                  const isChecked = bundleImport.selectedSkills.includes(skill.id);

                  return (
                    <label
                      key={skill.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-[10px] border p-2.5 transition-all duration-150 ${
                        isChecked
                          ? "border-brand-500/40 bg-brand-500/5"
                          : "border-border hover:border-brand-500/25 hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setBundleImport((current) => ({
                            ...current,
                            selectedSkills: current.selectedSkills.includes(skill.id)
                              ? current.selectedSkills.filter((id) => id !== skill.id)
                              : [...current.selectedSkills, skill.id],
                          }))
                        }
                        className="size-4 shrink-0 accent-primary"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-main">
                        {skill.name || skill.id}
                      </span>
                      {skill.exists ? (
                        <span className="shrink-0 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[11px] font-semibold text-yellow-600 dark:text-yellow-400">
                          Conflict
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold text-green-600 dark:text-green-400">
                          New
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
        {bundleImport?.step === 2 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            {bundleImport.status === "loading" && (
              <>
                <span className="material-symbols-outlined animate-spin text-[28px] text-primary">progress_activity</span>
                <p className="text-sm text-text-muted">Extracting selected skills...</p>
              </>
            )}
            {bundleImport.status === "success" && (
              <>
                <span className="material-symbols-outlined text-[28px] text-green-600 dark:text-green-400">check_circle</span>
                <p className="text-sm font-medium text-text-main">
                  Imported {bundleImport.result?.extracted?.length ?? bundleImport.selectedSkills.length} skill(s) successfully.
                </p>
              </>
            )}
            {bundleImport.status === "error" && (
              <>
                <span className="material-symbols-outlined text-[28px] text-red-600 dark:text-red-400">error</span>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{bundleImport.error}</p>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit Package Modal */}
      <Modal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        title={editingPackage ? "Edit Skill Package" : "Create Skill Package"}
        size="full"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPackageModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon="save"
              disabled={!packageName.trim() || savingPackage}
              onClick={handleSavePackage}
            >
              {savingPackage ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Input
            label="Package Name"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="e.g. Frontend Core, Marketing Pack"
          />
          <Input
            label="Description"
            value={packageDesc}
            onChange={(e) => setPackageDesc(e.target.value)}
            placeholder="Describe the target workflow or team for this package"
          />

          <Input
            label="Search Skills"
            value={packageSkillsSearch}
            onChange={(e) => setPackageSkillsSearch(e.target.value)}
            placeholder="Search skills by ID or Name..."
          />
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-main">Select Skills</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPackageSkills(skills.map((s) => s.id))}
                  className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-surface-2 transition-all"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setPackageSkills([])}
                  className="rounded px-2 py-1 text-xs font-semibold text-text-muted hover:bg-surface-2 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-h-[300px] overflow-y-auto rounded-lg border border-border p-3">
              {skills
                .filter(
                  (s) =>
                    (s.id || "").toLowerCase().includes(packageSkillsSearch.toLowerCase()) ||
                    (s.name || "").toLowerCase().includes(packageSkillsSearch.toLowerCase())
                )
                .map((skill) => {
                  const isChecked = packageSkills.includes(skill.id);
                  return (
                    <label
                      key={skill.id}
                      className={`flex items-start gap-2 text-sm cursor-pointer select-none p-2 rounded-lg border transition-all duration-150 ${
                        isChecked
                          ? "border-brand-500/40 bg-brand-500/5"
                          : "border-border hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-border text-brand-500 focus:ring-brand-500 size-3.5 shrink-0"
                        checked={isChecked}
                        onChange={() => {
                          setPackageSkills((current) =>
                            isChecked
                              ? current.filter((id) => id !== skill.id)
                              : [...current, skill.id]
                          );
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-semibold text-text-main text-xs truncate"
                          title={skill.name}
                        >
                          {skill.name}
                        </p>
                        <p
                          className="text-[10px] text-text-muted truncate mt-0.5"
                          title={skill.id}
                        >
                          {skill.id}
                        </p>
                      </div>
                    </label>
                  );
                })}
              {skills.filter(
                (s) =>
                  (s.id || "").toLowerCase().includes(packageSkillsSearch.toLowerCase()) ||
                  (s.name || "").toLowerCase().includes(packageSkillsSearch.toLowerCase())
              ).length === 0 && (
                <p className="col-span-full py-4 text-center text-xs text-text-muted">
                  No skills matched your search.
                </p>
              )}
            </div>
          </div>

          <Input
            label="Search Workflows"
            value={packageWorkflowsSearch}
            onChange={(e) => setPackageWorkflowsSearch(e.target.value)}
            placeholder="Search workflows by ID or Name..."
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-main">Select Workflows</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPackageWorkflows(workflows.map((w) => w.id))}
                  className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-surface-2 transition-all"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setPackageWorkflows([])}
                  className="rounded px-2 py-1 text-xs font-semibold text-text-muted hover:bg-surface-2 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-h-[300px] overflow-y-auto rounded-lg border border-border p-3">
              {workflows
                .filter(
                  (w) =>
                    (w.id || "").toLowerCase().includes(packageWorkflowsSearch.toLowerCase()) ||
                    (w.name || "").toLowerCase().includes(packageWorkflowsSearch.toLowerCase())
                )
                .map((wf) => {
                  const isChecked = packageWorkflows.includes(wf.id);
                  return (
                    <label
                      key={wf.id}
                      className={`flex items-start gap-2 text-sm cursor-pointer select-none p-2 rounded-lg border transition-all duration-150 ${
                        isChecked
                          ? "border-brand-500/40 bg-brand-500/5"
                          : "border-border hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-border text-brand-500 focus:ring-brand-500 size-3.5 shrink-0"
                        checked={isChecked}
                        onChange={() => {
                          setPackageWorkflows((current) =>
                            isChecked
                              ? current.filter((id) => id !== wf.id)
                              : [...current, wf.id]
                          );
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-semibold text-text-main text-xs truncate"
                          title={wf.name}
                        >
                          {wf.name}
                        </p>
                        <p
                          className="text-[10px] text-text-muted truncate mt-0.5"
                          title={wf.id}
                        >
                          {wf.id}
                        </p>
                      </div>
                    </label>
                  );
                })}
              {workflows.filter(
                (w) =>
                  (w.id || "").toLowerCase().includes(packageWorkflowsSearch.toLowerCase()) ||
                  (w.name || "").toLowerCase().includes(packageWorkflowsSearch.toLowerCase())
              ).length === 0 && (
                <p className="col-span-full py-4 text-center text-xs text-text-muted">
                  No workflows matched your search.
                </p>
              )}
            </div>
          </div>

          {packageError && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{packageError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
