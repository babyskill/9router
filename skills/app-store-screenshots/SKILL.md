---
name: app-store-screenshots
description: Specializes in generating high-conversion App Store and Google Play screenshots using Next.js and html-to-image. Handles design, copywriting, and bulk export at correct resolutions.
version: 1.0.0
trigger: conditional
activation_keywords:
  - "app store screenshots"
  - "play store screenshots"
  - "marketing screenshots"
  - "marketing assets"
  - "screenshot generator"
  - "android screenshots"
  - "ios screenshots"
---

# 📱 App Store & Google Play Screenshots Generator

This skill empowers you to build professional screenshot generators that render as **advertisements**, not just UI showcases. It leverages Next.js and `html-to-image` to ensure high-fidelity exports at all required Apple and Google resolutions.

## 🚀 Activation Triggers
Trigger this skill when asked to:
- "Build/Create App Store screenshots"
- "Generate marketing assets for the Play Store"
- "Design exportable screenshots for iOS/Android"

## 🛠️ Resources
- **Mockup**: iPhone mockup at `./resources/mockup.png`.
- **Note**: All other device frames (Android, iPad, Tablet) are rendered via CSS-only components defined in this skill.

## 📋 Interaction Flow

### Phase 1: Brand & Asset Discovery
Before any code is written, you MUST collect:
1. **Source Screenshots**: PNG captures of the actual app UI.
2. **App Icon**: PNG icon for branding slides.
3. **Brand Palette**: Accent, background, and text colors.
4. **Style Direction**: e.g., Dark/Moody, Clean/Minimal, Bold/Vibrant.
5. **Feature Priority**: Top 3-5 outcomes/benefits the app provides.

### Phase 2: Narrative & Copywriting
- **Rule**: One idea per slide.
- **Copy**: 3-5 words per headline. Readable at thumbnail size.
- **Tone**: Focus on outcomes, not feature lists.

### Phase 3: Scaffolding (Next.js)
The generator is always a single-file Next.js page (`page.tsx`) for simplicity.
- **Library**: `html-to-image` (Native SVG serialization).
- **Setup**: `bun create-next-app` (preferred) or `npx`.

### Phase 4: Resolution-Independent Design
Use the following coordinates and sizing logic provided in the reference instructions below.

---

## 📖 Reference Instructions (The Core Engine)

Build a Next.js page that renders App Store **and** Google Play screenshots as **advertisements** (not UI showcases) and exports them via `html-to-image` at Apple's and Google's required resolutions.

### Supported Devices
- **iPhone** (1320x2868)
- **iPad** (2064x2752)
- **Android Phone** (1080x1920)
- **Android Tablet 7" & 10"** (Portrait & Landscape)
- **Feature Graphic** (1024x500)

### ⚠️ Critical Implementation Rules
- **Double-Capture Trick**: `html-to-image` requires two sequential calls to warm up fonts/images.
- **Data URI Preloading**: ALL images (mockups, screenshots) MUST be converted to base64 data URIs at load time to prevent blank exports.
- **Canvas Scaling**: Use `ResizeObserver` and `transform: scale()` for the preview grid, but render at true resolution for export.

### [Core Device Geometries]
(Included in full in the implementation)
- iPhone Mockup Ratios (based on `./resources/mockup.png`)
- CSS-only frame components for iPad and Android.

---

> [!TIP]
> **Narrative Arc**: Start with a Hero (Main Benefit), follow with Differentiators, and end with a "Trust/More Features" slide.

> [!IMPORTANT]
> **Localization**: Supports RTL-native layouts for Arabic/Hebrew by mirroring asymmetric compositions intentionally.

---

*This skill was shipped by Antigravity from ParthJadhav/app-store-screenshots.*
