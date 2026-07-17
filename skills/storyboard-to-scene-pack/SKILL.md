---
name: storyboard-to-scene-pack
description: "Create end-to-end storyboard design packs for animation/video projects with continuity-safe per-scene prompts and reviewer-ready previews. Use when Codex needs to: (1) design a storyboard sheet, (2) generate prompts for each scene (default 8s per scene), (3) prepare keyframe image prompts with character/environment continuity, or (4) produce an HTML storyboard preview that shows each frame and its prompt."
---

# Storyboard To Scene Pack

Build a reusable storyboard pipeline that turns one concept into a continuity-safe scene package and reviewable preview.

## Workflow

1. Collect a compact brief.
2. Build continuity locks.
3. Draft storyboard plan and panel prompts.
4. Generate per-scene keyframe prompts (default `duration: 8s`).
5. Produce preview output (hand-drawn storyboard prompt + HTML preview data).

## Step 1: Collect Brief

Capture only what is required:

- Project title and one-line premise
- Visual style (for example: pencil sketch, noir ink, watercolor)
- Character list (name, role, physical anchors, wardrobe anchors)
- Environment anchors (layout elements that must persist)
- Total scene count and target duration per scene (default 8s)
- Tone and camera language preferences

If input is missing, assume safe defaults and continue.

## Step 2: Build Continuity Locks

Before generating scene prompts, define immutable anchors:

- Character Bible: face/hair/body/clothes/props signatures
- Environment Bible: spatial map and recurring objects
- Time/lighting continuity: time-of-day and light direction
- State continuity tokens: object states carried across scenes

Use [continuity-checklist.md](references/continuity-checklist.md) to validate.

## Step 3: Draft Storyboard Plan

Create a panel plan first, then prompts:

- Use a grid format (`3x4` default) with numbered panels
- For each panel, define `scene`, `action`, `dialogue`, `camera`
- Keep camera progression intentional (wide -> medium -> close-up as needed)
- Include explicit shot/move labels when relevant (`WIDE SHOT`, `PAN LEFT`, `TILT UP`, `ZOOM IN`)

For hand-drawn storyboard sheet generation, use [storyboard-sheet-template.md](references/storyboard-sheet-template.md).

## Step 4: Generate Per-Scene Prompt Pack

For each scene, output one prompt block with this schema:

- `scene_id`
- `duration_seconds` (default `8`)
- `goal_of_scene`
- `visual_prompt`
- `camera_prompt`
- `continuity_from_previous`
- `negative_constraints`

Prefer explicit continuity phrasing, for example: "same wardrobe as Scene 03", "knife remains in right hand", "steam intensity reduced from prior scene".

Use [scene-prompt-template.md](references/scene-prompt-template.md).

## Step 5: Produce Preview Artifacts

Always provide these outputs:

- Hand-drawn storyboard sheet prompt (single-sheet overview)
- Scene prompt list (JSON or Markdown table)
- HTML preview mapping each frame to its prompt and continuity notes

Use [preview-template/index.html](assets/preview-template/index.html) as the base layout.

## Output Contract

Return outputs in this structure:

- `storyboard/handdrawn_storyboard_prompt.md`
- `storyboard/scene_prompts.json`
- `preview/index.html`

If scene images are already available, reference them in preview as:

- `scenes/scene_01.png`
- `scenes/scene_02.png`
- `...`

## Quality Gate

Validate before finalizing:

- Panel numbering is complete and ordered
- Character and wardrobe continuity is preserved
- Environment anchors stay consistent
- Camera sequence supports narrative clarity
- Every scene has explicit 8s duration (or user-specified override)
- HTML preview contains both image slot and prompt text per scene
