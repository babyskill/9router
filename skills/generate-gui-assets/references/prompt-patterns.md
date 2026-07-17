# GUI Asset Prompt Patterns

## Master Atlas

Use for early style discovery across many related packs.

```text
Create one high-resolution GUI asset master atlas on a flat #FF00FF chroma-key background.
Style: <product/game style>, consistent palette, crisp clean edges, readable silhouettes.
Groups: <number> labeled only in this prompt, not in the image.
Each group uses its own grid: <pack name> <grid> with icons <names in row order>.
Layout: equal spacing, centered icons, 10% safe margin, no object touches cell borders.
Quality rules: no text, no labels, no guide marks, no shadows, no glow, no scenery, no duplicate generic placeholders, no clipping, no overlap.
```

## Bulk Canvas Atlas

Use after the user confirms preview style and chooses a uniform slicing grid. This is the default bulk strategy for reducing generation count.

```text
Create one GUI icon atlas on a flat #FF00FF chroma-key background.
Style lock: match the approved preview exactly: <frozen style language>.
Canvas grid: <columns>x<rows> total icon cells, equal cell size, consistent spacing, centered icons, 10% safe margin.
Icons in row order, left to right then top to bottom: <names>.
Keep related icons near each other when possible, but preserve one icon per grid cell.
Quality rules: no text, no labels, no guide marks, no shadows, no glow, no scenery, no duplicate generic placeholders, no clipping, no overlap.
```

## Focused Pack

Use when one pack is weak but the global style is approved.

```text
Create one GUI icon atlas on a flat #FF00FF chroma-key background.
Style lock: match the approved pack family: <frozen style language>.
Grid: <columns>x<rows>, equal cells, centered icons, generous padding.
Icons in row order: <names>.
Quality rules: no text, no labels, no shadows, no glow, no guides, no duplicate placeholders, no clipping, no overlap.
```

## Game HUD Pack

```text
Create a game HUD asset atlas on a flat #FF00FF chroma-key background.
Style: <game art direction>, readable at small sizes, clean silhouettes.
Grid: <columns>x<rows>, equal cells.
Assets in row order: <health, mana, coin, timer, etc.>.
Do not include numbers, text, labels, panels, background scenery, cast shadows, glow, or particle effects.
```

## Repair Language

Add only the failing constraint:

- For clipping: `Every icon must stay 10-12% away from cell borders; no icon touches or crosses an edge.`
- For semantic drift: `Each icon must clearly represent its exact named concept; do not use generic circles or repeated placeholders.`
- For style drift: `Match the approved family exactly: same outline weight, palette, shape language, and shading depth.`
- For extraction issues: `Use a perfectly flat #FF00FF background with no antialiasing into the background color.`
