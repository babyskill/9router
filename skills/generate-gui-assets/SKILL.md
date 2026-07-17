---
name: generate-gui-assets
description: Tao bo asset GUI dong nhat cho app/game, gom icon atlas, HUD UI, bo icon ung dung, va sprite sheet UI voi prompt tao anh, rang buoc chroma-key, manifest, contact sheet, QA, va quy trinh copy/extract mang tinh xac dinh. Dung khi Codex can tao hoac to chuc asset GUI cho app/game, dac biet voi bo nhieu icon, asset dang atlas, hinh anh UI can dong bo style, catalog.json/icons_manifest.json, hoac QA hinh anh truoc khi wire vao code.
---

# Generate GUI Assets

## Overview

Create GUI asset packs using a generation-first workflow: plan the pack, generate atlas imagery through `$imagegen`, preserve provenance, review a contact sheet, then run deterministic scripts only after the visuals are approved.

This skill is for app/game GUI assets: icons, HUD items, buttons, status badges, inventory icons, navigation glyphs, weather/health/habit packs, and other atlas-friendly UI assets. Use `hatch-pet` instead for animated Codex pet spritesheets or character animation rows.

## Hard Boundaries

- Use `$imagegen` for visual creation. Do not locally draw, tile, synthesize, or fabricate missing GUI assets with code.
- Prefer grid/atlas generation for batches. Do not generate one image per icon unless a grid fails quality after focused retries or the user asks for a single asset.
- When strict atlas grids repeatedly fail structure quality (merged cells, uneven columns, missing slots), switch to `large object sheet -> detect/crop -> repack` instead of repeating direct atlas retries.
- Keep app code wiring out of this skill. Stop at approved asset files, manifests, QA outputs, and handoff notes.
- Do not recut or resegment an extraction method that has already been approved. Copy/rename approved icons as-is and record provenance.
- Parent agent owns manifests and final file moves. Subagents may generate or review isolated packs, but should not mutate `catalog.json` or final manifests.

## Intrinsic-First Policy

- Default path is intrinsic image generation only (`image_gen` via `$imagegen`).
- Do not precheck, mention, or require provider API keys during normal preview/bulk flows.
- Fallback providers are opt-in only and require explicit user request plus both `OPENAI_API_KEY` and `OPENROUTER_API_KEY`.
- If fallback is not explicitly requested, continue with intrinsic generation and report only intrinsic status.
- Never claim preview or generation progress unless real generated images exist in `raw/`.

## Folder Contract

Use this structure for generation runs:

```text
assets/ui/generated/<run-id>/
  raw/              # direct generated atlas/pack images
  prompts/          # generated prompt text
  qa/               # contact sheets and review notes
  catalog.json      # generation provenance and pack mapping
```

For extracted approved icons, use a separate flat package folder:

```text
assets/ui/generated/<run-id>/final/
  icons/
  icons_manifest.json
```

Run folders under `assets/ui/generated/<run-id>/` are staging workspaces, not the canonical app asset location. Before marking the asset work done, copy the approved files into the project's real asset family directory, for example:

```text
assets/ui/icons/<version>/final/
  ic_<name>.png
  ic_<name>@2x.png
  ic_<name>@3x.png
  icons_manifest.json
  catalog.json
```

Use the project's existing asset maps and conventions when choosing the canonical folder. The canonical `catalog.json` and `icons_manifest.json` must describe the files in that final project directory, not only the staging run directory.

After the canonical files and manifests exist, the app points at them, and verification passes, proactively clean the staging run by moving it to Trash or an archive outside the repo. Do not delete approved canonical assets, source-controlled project manifests, or user-provided references.

## Default Workflow

1. Build canvas grid options and ask for one-time confirmation before any generation (Goal Mode: Auto-select recommended grid strategy, e.g. 8x6 for high throughput, and proceed).

Always present total icon capacity from larger to smaller. These are uniform canvas grids for deterministic slicing, not arbitrary pack boxes:

- `8x6` (48 slots): maximum throughput in one image after preview approval.
- `8x5` (40 slots): high throughput with more vertical breathing room.
- `6x6` (36 slots): high throughput, square-ish canvas.
- `6x5` (30 slots): balanced bulk layout.
- `7x4` (28 slots): wide balanced layout.
- `5x5` (25 slots): compact dense layout.
- `6x4` (24 slots): wide compact layout.
- `4x4` (16 slots): quality-priority compact bulk.
- `4x3` (12 slots): fallback for difficult semantics.
- `3x3` (9 slots): precision fallback.

Use this helper:

```bash
SKILL_DIR="${CODEX_HOME:-$HOME/.codex}/skills/generate-gui-assets"
python "$SKILL_DIR/scripts/suggest_grid_options.py" --icon-count 18 --strategy throughput
```

Do not generate preview or bulk until the user confirms one canvas grid strategy (Goal Mode: Auto-select recommended grid strategy and proceed).

Use this confirmation template exactly (largest to smallest, one-time confirm):

```text
Canvas grid options (large -> small, uniform cells for slicing):
- 8x6 = 48 icons/image: max throughput, use after preview confirms style.
- 8x5 = 40 icons/image.
- 6x6 = 36 icons/image.
- 6x5 = 30 icons/image.
- 7x4 = 28 icons/image.
- 5x5 = 25 icons/image.
- 6x4 = 24 icons/image.
- 4x4 = 16 icons/image: compact quality-priority option.
- 4x3 = 12 icons/image.
- 3x3 = 9 icons/image.

Recommend: 8x6 for this run if the preview style is approved.
Please confirm one canvas grid for the whole run.
```

2. Create a preview run and catalog first:

```bash
SKILL_DIR="${CODEX_HOME:-$HOME/.codex}/skills/generate-gui-assets"
python "$SKILL_DIR/scripts/prepare_gui_asset_run.py" \
  --run-id gui-v1-preview \
  --output-root assets/ui/generated \
  --phase preview \
  --style-notes "cozy mobile wellness garden icons, crisp rounded vector style" \
  --pack "ui_weather_core:3x3:sun,sunCloud,cloud,rain,wind,hot,mild,good,bad"
```

3. Read preview prompts in `prompts/` and invoke `$imagegen`.

Before generating, load the installed image generation skill:

```text
${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/SKILL.md
```

Use the generated prompt as the authoritative visual spec. Save selected `$imagegen` outputs into `raw/` and update `catalog.json` provenance.

4. Build a contact sheet and review with the user:

```bash
python "$SKILL_DIR/scripts/build_gui_contact_sheet.py" \
  --run-dir assets/ui/generated/gui-v1-preview
```

5. Wait for explicit user confirmation. Do not run bulk generation before preview is approved (Goal Mode: Auto-approve preview and immediately launch bulk generation).

6. After approval, create the bulk run using locked style language:

```bash
python "$SKILL_DIR/scripts/prepare_gui_asset_run.py" \
  --run-id gui-v1-bulk \
  --output-root assets/ui/generated \
  --phase bulk \
  --style-notes "<approved preview style language>" \
  --pack "ui_nav_core:4x3:home,garden,journal,profile,settings,search,back,next,add,close,alert,help" \
  --pack "ui_health_core:4x3:heart,water,sleep,steps,mood,warning,aid,trend,info,check,flame,medical"
```

7. Validate the catalog:

```bash
python "$SKILL_DIR/scripts/validate_gui_catalog.py" \
  --run-dir assets/ui/generated/gui-v1-bulk
```

8. After visual approval and extraction, copy approved icons without recutting:

```bash
python "$SKILL_DIR/scripts/copy_approved_icons.py" \
  --source-dir assets/ui/generated/gui-v1/manual_crop/extracted_icons_mask \
  --run-dir assets/ui/generated/gui-v1-bulk \
  --mapping path/to/icon_mapping.json
```

9. Promote approved assets into the canonical project asset directory and write canonical manifests there. Treat the staging run's `final/` folder as a transfer source only; update code asset maps against the canonical directory.

10. After verification, move obsolete staging runs, preview runs, raw atlases, prompts, and QA-only outputs out of the repo. Keep a recoverable copy in Trash or an archive when the cleanup is destructive from git's point of view.

## Large Object Sheet Workflow (High-Throughput Fallback)

Use this path when the user wants one large generation request and strict direct grid output is unstable.

1. Generate one large `object sheet` image, not a direct atlas.
- Flat `#FF00FF` chroma background only.
- No grid lines, no panels, no scenery, no labels.
- Exactly one isolated icon object per semantic item.
- Large empty chroma spacing between icons to avoid touching components.

2. Detect and crop icons from the object sheet.
- Use connected-component or contour detection with magenta-threshold masking.
- Remove tiny specks/fragments with area and size thresholds.
- If symbols are split into multiple small components, merge nearby components before crop.

3. Normalize and repack into a deterministic atlas.
- Resize each icon into a fixed cell canvas (for example `256x256`) using consistent max side ratio.
- Center-align icon in each cell with constant padding.
- Compose final `8x6` atlas from normalized cells.
- Export both atlas and per-icon PNG files for QA.

4. Produce mapping artifacts.
- `icons_manifest.json` must include packed index, semantic name, source bbox/component id, and output file path.
- Build a numbered contact sheet for human semantic verification.

## Chroma Edge Cleanup

Run this deterministic cleanup after extraction or promotion when transparent PNG icons still show magenta/chroma fringe, pink-purple baked edge spill, or dirty hidden RGB that can appear during app scaling.

Use the bundled cleaner, not ad hoc per-file edits:

```bash
SKILL_DIR="${CODEX_HOME:-$HOME/.codex}/skills/generate-gui-assets"
python "$SKILL_DIR/scripts/clean_chroma_edges.py" path/to/icons --edge-despill
python "$SKILL_DIR/scripts/clean_chroma_edges.py" path/to/icons --edge-despill --apply
```

Default behavior:

- Recurses through PNG files under every provided directory.
- Soft-keys low-alpha pixels near `#FF00FF`.
- Bleeds nearby foreground RGB into transparent edge pixels so scaling cannot sample hidden chroma.
- With `--edge-despill`, repairs opaque baked-in pink/purple spill along the alpha edge without changing interior pink UI colors.

Use these guardrails:

- Always run dry-run first and inspect the reported file count.
- Use `--edge-despill` for baked magenta outlines like pink halos around characters or icons.
- Skip `--edge-despill` if the asset intentionally has magenta/purple edge styling.
- Apply only to approved extracted/canonical PNG assets, not raw generated atlases unless they already have transparency.
- After applying, run the same command again as a dry-run; it should report `DRY_RUN files=0 changed=0` or only a tiny known residual that is intentional art.
- Build a contact sheet or composite preview on light and dark neutral backgrounds before handoff.

For canonical GUI packs, the expected verification sequence is:

```bash
python "$SKILL_DIR/scripts/clean_chroma_edges.py" assets/ui/icons/<version>/final --edge-despill
python "$SKILL_DIR/scripts/clean_chroma_edges.py" assets/ui/icons/<version>/final --edge-despill --apply
python "$SKILL_DIR/scripts/clean_chroma_edges.py" assets/ui/icons/<version>/final --edge-despill
```

## Prompt Contract

Every generation prompt must include:

- Style: concise product/game style, palette, outline/edge treatment, target platform tone.
- Geometry: exact total canvas grid size, equal cells, centered icons, generous padding, no object touching cell edges.
- Semantics: explicit icon names in row order.
- Background: flat chroma key `#FF00FF` unless the project requires another key.
- Prohibitions: no text, labels, guide marks, shadows, glows, UI panels, scenery, duplicate placeholders, or unrelated decoration.

Prefer this prompt shape:

```text
Create one GUI icon atlas on a flat #FF00FF chroma-key background.
Style: <style notes>.
Canvas grid: <columns>x<rows> total icon cells, equal cells, centered icons, 10% safe margin.
Icons in row order: <comma-separated names>.
Quality rules: no text, no labels, no shadows, no glow, no guides, no duplicate generic placeholders, no clipping, no overlap.
```

For large object-sheet fallback, use this shape:

```text
Create one large icon object sheet on flat #FF00FF background.
Style: <style notes>.
Layout: no grid lines, no panels; icons arranged in loose rows with wide empty magenta spacing.
Objects: exactly one isolated icon per semantic item; do not touch or overlap.
Icons list: <comma-separated names>.
Quality rules: no text, no labels, no scenery, no glow, no shadows outside silhouette, no merged icons.
```

## Iteration Strategy

- Always run preview-first and require explicit user confirmation before bulk generation (Goal Mode: Bypass confirmation, auto-approve).
- Ask for grid confirmation exactly once per run before preview (Goal Mode: Bypass confirmation, auto-select recommended).
- Prefer larger total canvas grids first to reduce generation count, then step down only if preview quality is unacceptable.
- In throughput strategy, recommend `8x6` first for up to 48 icons per image.
- Treat `4x4` as a compact quality-priority option, not the default large-layout recommendation.
- Freeze the approved preview style language and reuse it unchanged in bulk mode.
- Run bulk to reduce generation count once preview is approved.
- Regenerate only weak packs or isolated semantic misses with style lock.
- If a specific semantic icon is wrong, prefer a focused pack regeneration over manual visual patching.
- If magenta fringing or extraction quality is the issue, treat it as post-processing, not a reason to change the approved visual direction.
- If direct `8x6` generation fails structure quality twice, stop retry loop and move to the large object-sheet workflow.
- For object-sheet workflow, prefer one large request plus deterministic repack over repeated direct-atlas retries.

## QA Checklist

Before handoff:

- `catalog.json` parses and lists every intended pack.
- Every raw image path exists and opens.
- `qa/contact_sheet.png` exists.
- Icons match requested semantics in row order.
- Style is consistent across packs.
- No clipped icons, shadows, glows, labels, guide marks, or duplicate placeholders.
- Approved extraction/copy keeps original icon pixels and records provenance.
- Canonical project asset directory contains the shipped icons and canonical `icons_manifest.json` plus `catalog.json`.
- Code asset maps reference canonical project paths, not `assets/ui/generated/<run-id>/`.
- Completed staging runs have been moved out of the repo or intentionally retained with a short reason.
- For object-sheet workflow: detected icon count must be >= intended count before selection.
- For object-sheet workflow: final packed atlas dimensions and cell counts must match target exactly.
- For object-sheet workflow: manifest must map every packed slot to a semantic name and source component.
- Chroma cleanup dry-run is clean or residual findings are explained as intentional art.
- Contact sheet or neutral-background preview shows no visible chroma fringe at the expected in-app size.

## References

- Read `references/prompt-patterns.md` when constructing or repairing prompts.
- Read `references/catalog-schema.md` before editing `catalog.json` or `icons_manifest.json`.
- Read `references/extraction-techniques.md` before copying or renaming approved extracted icons.
