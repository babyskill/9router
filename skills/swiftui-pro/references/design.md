# Design

## Creating a uniform design in this app

Prefer to place standard fonts, sizes, colors, stack spacing, padding, rounding, animation timings, and more into a shared enum of constants, so they can be used by all views. This allows the app’s design to feel uniform and consistent, and be adjusted easily.


## Requirements for flexible, accessible design

- Never use `UIScreen.main.bounds` to read available space; prefer alternatives such as `containerRelativeFrame()`, or `visualEffect()` as appropriate, or (if there is no alternative) `GeometryReader`.
- Prefer to avoid fixed frames for views unless content can fit neatly inside; this can cause problems across different device sizes, different Dynamic Type settings, and more. Giving frames some flexibility is usually preferred.
- Apple’s minimum acceptable tap area for interactions on iOS is 44x44. Ensure this is strictly enforced.


## Standard system styling

- Strongly prefer to use `ContentUnavailableView` when data is missing or empty, rather than designing something custom.
- When using `searchable()`, you can show empty results using `ContentUnavailableView.search` and it will include the search term they used automatically – there’s no need to use `ContentUnavailableView.search(text: searchText)` or similar.
- If you need an icon and some text placed horizontally side by side, prefer `Label` over `HStack`.
- Prefer system hierarchical styles (e.g. secondary/tertiary) over manual opacity when possible, so the system can adapt to the correct context automatically.
- When using `Form`, wrap controls such as `Slider` in `LabeledContent` so the title and control are laid out correctly.
- When using `RoundedRectangle`, the default rounding style is `.continuous` – there is no need to specify it explicitly.


## Ensuring designs work for everyone

- Use `bold()` instead of `fontWeight(.bold)`, because using `bold()` allows the system to choose the correct weight for the current context.
- Only use `fontWeight()` for weights other than bold when there's an important reason - scattering around `fontWeight(.medium)` or `fontWeight(.semibold)` is counterproductive.
- Avoid hard-coded values for padding and stack spacing unless specifically requested.
- Avoid UIKit colors (`UIColor`) in SwiftUI code; use SwiftUI `Color` or asset catalog colors.
- The font size `.caption2` is extremely small, and is generally best avoided. Even the font size `.caption` is on the small side, and should be used carefully.


## Dark Mode Color Safety Rules

These rules prevent common dark mode bugs that are invisible in light mode development.

### 1. Never use hardcoded `Color.white` or `Color.black` for backgrounds or fills
- **Bad**: `.fill(Color.white)`, `.background(Color.black)`
- **Good**: `.fill(ColorPalette.darkCard)`, `.background(ColorPalette.backgroundPrimary)`
- **Exception**: White/black on a NON-adaptive surface (e.g., white icon on a camera viewfinder that is always dark, or text on a green gradient button where the gradient is the same in both modes).

### 2. Never pair `.foregroundColor(.white)` with an adaptive fill
- If a button uses an adaptive fill like `ColorPalette.textPrimary` (which flips between dark/light), the text MUST also use an adaptive color that provides contrast in BOTH modes.
- **Bad**: `.fill(ColorPalette.textPrimary)` + `.foregroundColor(.white)` — in dark mode, textPrimary ≈ #EDEDED and .white = #FFFFFF → invisible text!
- **Good**: `.fill(ColorPalette.textPrimary)` + `.foregroundColor(ColorPalette.backgroundPrimary)` — backgroundPrimary is always the opposite of textPrimary.
- **Rule of thumb**: If fill is adaptive, text color MUST be its inverse adaptive token.

### 3. Static background images (PNG/JPG) don't adapt to dark mode
- Background images with light themes (e.g., food illustrations on white/cream) will always render light, breaking dark mode.
- **Fix options**:
  - Provide dark variants in the Asset catalog and use `@Environment(\.colorScheme)` to switch.
  - Reduce opacity in dark mode: `.opacity(colorScheme == .dark ? 0.08 : 1.0)`.
  - Apply a dark overlay or color multiply blend.
- **Exception**: Screenshot/mockup images displayed inside a dark phone frame (the frame provides context).

### 4. Always verify contrast between text and its immediate background
- When reading code, mentally resolve what every color token becomes in BOTH modes.
- Common trap: Card background = `#272727` (dark gray in dark mode), button fill = `#EDEDED` (light in dark mode), text on button = `.white` → barely visible.
- **Paired tokens for high contrast**:
  - Fill: `textPrimary` ↔ Text: `backgroundPrimary`
  - Fill: `darkCard` ↔ Text: `textPrimary`
  - Fill: `primaryGreen` ↔ Text: `.white` (green is always green)

### 5. Shadow colors must be adaptive
- **Bad**: `.shadow(color: Color.black.opacity(0.1), ...)`
- **Good**: `.shadow(color: ColorPalette.shadowLight, ...)` or `.shadow(color: ColorPalette.textPrimary.opacity(0.08), ...)`
- In dark mode, black shadows on dark backgrounds are invisible; use lighter shadow tokens or skip shadows entirely.

### 6. Quick dark mode audit checklist
When writing or reviewing any SwiftUI view:
1. `grep -n 'Color\.white\|Color\.black\|\.white\b' FileName.swift` — find all hardcoded colors.
2. For each hit, ask: "Does this element sit on an adaptive background?" If yes → replace with adaptive token.
3. Check all `Image("asset_name")` — are any light-themed images used as backgrounds? If yes → add dark mode handling.
4. For every button: verify fill color + text color provide 4.5:1 contrast ratio in BOTH modes.
