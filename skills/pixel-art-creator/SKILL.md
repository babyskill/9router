---
name: Pixel Art Creator
description: Create new pixel art sprites from scratch with canvas creation, layer management, and basic drawing primitives via Aseprite MCP Server. Supports all basic shapes, precision pixel pushing, and indexed color schemes (Retro/Gameboy/NES). Trigger on requesting pixel art creation, pixel dimensions, "from scratch", or pixel shapes.
---

# Pixel Art Creator

## Overview
This Skill enables creation of new pixel art sprites with full control over canvas properties, layers, and basic drawing operations. It's the foundational Skill for all pixel art workflows.

## When to Use
Use this Skill when the user:
- Wants to "create a sprite" or "make pixel art"
- Mentions sprite dimensions (e.g., "64x64", "32 by 32", "128 pixels wide")
- Asks to "draw" basic shapes (pixels, lines, rectangles, circles)
- Needs to set up a canvas or layers
- Mentions color modes (RGB, Grayscale, Indexed)

**Trigger Keywords:** create, sprite, canvas, draw, pixel art, dimensions, layer, new sprite

## Instructions

### 1. Creating a Canvas
When the user requests a sprite, create the canvas first:

**Color Modes:**
- **RGB**: Full color (24-bit), best for modern pixel art
- **Grayscale**: Shades of gray only, for monochrome art
- **Indexed**: Limited palette (1-256 colors), for retro game art

**Recommended Sizes:**
- **Icons**: 16x16, 24x24, 32x32
- **Characters**: 32x32, 48x48, 64x64
- **Tiles**: 16x16, 32x32, 64x64
- **Scenes**: 128x128, 256x256, 320x240 (retro resolution)

Use `mcp__aseprite__create_canvas` (or equivalent Aseprite MCP tool) with parameters:
- `width`: 1-65535 pixels
- `height`: 1-65535 pixels
- `color_mode`: "RGB", "Grayscale", or "Indexed"

### 2. Managing Layers
Use `mcp__aseprite__add_layer` to organize sprite elements:
- Background layer for solid colors or backgrounds
- Character layer for main subject
- Effects layer for highlights, shadows, outlines
- Detail layer for accessories or fine details

**Layer Workflow:**
1. Create canvas
2. Add named layers (e.g., "Background", "Character", "Effects")
3. Draw on specific layers
4. Use layers for organization and editing flexibility
**Important:** Cannot delete the last layer in a sprite.

### 3. Drawing Primitives
**Draw Individual Pixels:** Use `mcp__aseprite__draw_pixels` for precise pixel placement:
- Supports batch operations (multiple pixels at once)
- Accepts colors in hex format (#RRGGBB) or palette indices

**Draw Lines:** Use `mcp__aseprite__draw_line`
**Draw Rectangles:** Use `mcp__aseprite__draw_rectangle` (Filled or outline mode)
**Draw Circles/Ellipses:** Use `mcp__aseprite__draw_circle`
**Draw Contours (Polygons):** Use `mcp__aseprite__draw_contour`
**Flood Fill:** Use `mcp__aseprite__fill_area`

### 4. Working with Colors
**Setting Colors:**
- **Hex Format**: #RRGGBB (e.g., #FF0000 for red)
- **Palette Index**: For Indexed mode (0-255)

**Color Palettes:**
For Indexed color mode, set the palette first:
- Use `mcp__aseprite__set_palette` with array of hex colors

### 5. Workflow Best Practices
**Typical Creation Workflow:**
1. **Understand Requirements** (Size, Color mode, Style)
2. **Create Canvas**
3. **Set Up Layers** (optional but recommended)
4. **Set Palette** (for Indexed mode like NES, Game Boy)
5. **Draw Basic Shapes** (Start with outline -> Fill -> Detail)
6. **Verify Result** (Use `mcp__aseprite__get_sprite_info` to check properties)
7. **Export**

## Error Handling
**If canvas creation fails:** Check dimensions are valid (1-65535) and color mode is spelled correctly.
**If drawing fails:** Verify coordinates are within canvas bounds and color format is valid hex (#RRGGBB).
**If layer operations fail:** Cannot delete last layer. Layer names should be descriptive strings.
