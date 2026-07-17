---
name: aseprite-artist
description: "Pixel art creation, animation, and export via Aseprite + pixel-mcp MCP Server. Supports natural language drawing, retro palettes (NES, Game Boy, PICO-8, C64), dithering, shading, antialiasing, animation frames, and game-engine spritesheet export. Keywords: pixel art, sprite, aseprite, dithering, palette, animation, mascot, retro, 8-bit, 16-bit, pixel, spritesheet, game asset, icon."
version: 1.0.0
trigger: conditional
activation_keywords:
  - "pixel art"
  - "sprite"
  - "aseprite"
  - "pixel"
  - "dithering"
  - "retro palette"
  - "spritesheet"
  - "game asset"
  - "mascot"
  - "8-bit"
  - "16-bit"
  - "pixel icon"
  - "walk cycle"
  - "idle animation"
  - "NES palette"
  - "Game Boy"
  - "PICO-8"
---

# 🎨 Aseprite Artist — Pixel Art Creation Skill

> Adapted from [pixel-plugin](https://github.com/willibrandon/pixel-plugin) by Brandon Williams (MIT).
> Powered by [pixel-mcp](https://github.com/willibrandon/pixel-mcp) — 40+ MCP tools for Aseprite.

## Purpose

Enable AI to create, edit, animate, and export pixel art sprites through natural language using the **pixel-mcp** MCP server as the bridge to Aseprite. This skill consolidates what was originally 4 separate Claude Code skills (creator, animator, professional, exporter) into a single, unified Antigravity skill.

## Prerequisites

1. **Aseprite v1.3.0+** installed on the system.
2. **pixel-mcp** MCP server configured and running.
3. Config file at `~/.config/pixel-mcp/config.json` with valid `aseprite_path`.

### First-Time Setup

If user has never set up pixel-mcp, run the `/pixel-setup` workflow or do it manually:

```bash
# 1. Install pixel-mcp (Go binary — download from releases or build)
# GitHub: https://github.com/willibrandon/pixel-mcp/releases

# 2. Create config
mkdir -p ~/.config/pixel-mcp
cat > ~/.config/pixel-mcp/config.json << 'EOF'
{
  "aseprite_path": "/Applications/Aseprite.app/Contents/MacOS/aseprite",
  "temp_dir": "/tmp/pixel-mcp",
  "timeout": 30,
  "log_level": "info"
}
EOF

# 3. Add to MCP config (mcp_config.json) — the "aseprite" server entry
```

### MCP Config Entry

Add to `mcp_config.json`:

```json
{
  "mcpServers": {
    "aseprite": {
      "command": "/path/to/pixel-mcp",
      "args": []
    }
  }
}
```

Or if using npx (if published):
```json
{
  "mcpServers": {
    "aseprite": {
      "command": "npx",
      "args": ["-y", "pixel-mcp"]
    }
  }
}
```

---

## Tool Reference (40+ MCP Tools)

All tools are prefixed with `mcp__aseprite__` in the MCP protocol.

### Canvas & Layer Management
| Tool | Purpose |
|------|---------|
| `create_canvas` | Create new sprite (width, height, color_mode: RGB/Grayscale/Indexed) |
| `add_layer` | Add named layer to sprite |
| `delete_layer` | Remove layer (cannot delete last layer) |
| `flatten_layers` | Merge all layers into one |
| `get_sprite_info` | Get sprite dimensions, color mode, layer count, frame count |

### Drawing Primitives
| Tool | Purpose |
|------|---------|
| `draw_pixels` | Batch draw individual pixels (coordinates + colors) |
| `draw_line` | Draw line between two points |
| `draw_rectangle` | Draw filled or outline rectangle |
| `draw_circle` | Draw filled or outline circle/ellipse |
| `draw_contour` | Draw polyline/polygon connecting multiple points |
| `fill_area` | Flood fill connected area (paint bucket) |

### Selection & Clipboard
| Tool | Purpose |
|------|---------|
| `select_rectangle` | Rectangle selection |
| `select_ellipse` | Ellipse selection |
| `select_all` | Select entire canvas |
| `deselect` | Clear selection |
| `move_selection` | Move selection area |
| `cut_selection` | Cut selected area to clipboard |
| `copy_selection` | Copy selected area to clipboard |
| `paste_clipboard` | Paste clipboard content |

### Professional Pixel Art
| Tool | Purpose |
|------|---------|
| `analyze_reference` | Extract palettes, brightness maps, edge detection from images |
| `draw_with_dither` | Apply dithering patterns (Bayer 2x2/4x4/8x8, Floyd-Steinberg, checkerboard, textures) |
| `downsample_image` | Convert image to pixel art by reducing resolution |
| `quantize_palette` | Reduce colors intelligently (median_cut, k-means, octree) |
| `apply_auto_shading` | Automatic geometry-based shading (cell/smooth/soft, 8 directions) |
| `suggest_antialiasing` | Detect jagged edges and suggest smoothing colors |
| `analyze_palette_harmonies` | Analyze color harmony (complementary/triadic/analogous) |

### Palette Management
| Tool | Purpose |
|------|---------|
| `get_palette` | Read current palette |
| `set_palette` | Set entire palette (array of hex colors) |
| `set_palette_color` | Change single palette entry |
| `add_palette_color` | Add color to palette |
| `sort_palette` | Sort by hue/luminance |

### Transform & Filter
| Tool | Purpose |
|------|---------|
| `flip_sprite` | Flip horizontal/vertical |
| `rotate_sprite` | Rotate sprite |
| `scale_sprite` | Scale up/down |
| `crop_sprite` | Crop to content |
| `resize_canvas` | Resize canvas without scaling content |
| `apply_outline` | Add outline around opaque pixels |

### Animation
| Tool | Purpose |
|------|---------|
| `add_frame` | Add new animation frame |
| `delete_frame` | Remove frame |
| `duplicate_frame` | Copy frame |
| `set_frame_duration` | Set frame timing (ms) |
| `create_tag` | Create animation tag (idle, walk, etc.) |
| `delete_tag` | Remove animation tag |
| `link_cel` | Link cel between frames (shared content) |

### Export
| Tool | Purpose |
|------|---------|
| `export_sprite` | Export as PNG/GIF/JPG/BMP with scale |
| `export_spritesheet` | Export spritesheet (horizontal/vertical/grid/packed layout) |
| `import_image` | Import external image into sprite |
| `save_as` | Save sprite in Aseprite format |
| `get_pixels` | Read pixel data for verification |

---

## Workflow: Creating Pixel Art

### Phase 1: Understand Requirements
- What size? (16x16 icon, 32x32 character, 64x64 detailed, 128x128 scene)
- What style? (modern RGB vs retro indexed)
- What palette? (custom, NES, Game Boy, PICO-8, etc.)
- Animation needed? (idle, walk, attack, etc.)

### Phase 2: Canvas Setup
1. `create_canvas` with appropriate width, height, color_mode
2. `set_palette` if using retro/indexed mode
3. `add_layer` for organization (Background, Character, Effects)

### Phase 3: Drawing
1. Start with silhouette using `draw_rectangle`, `draw_circle`, `draw_contour`
2. Refine with `draw_pixels` for details
3. Use `fill_area` for large regions
4. Apply `draw_with_dither` for textures

### Phase 4: Polish
1. `apply_auto_shading` for quick lighting (or manual shading with layers)
2. `suggest_antialiasing` for smooth edges on larger sprites
3. `quantize_palette` if reducing colors
4. `sort_palette` for organized color table

### Phase 5: Animate (if needed)
1. `add_frame` for each animation frame
2. `set_frame_duration` for timing (typical: 80-150ms per frame)
3. `create_tag` to label animation sequences
4. Use `duplicate_frame` as starting point, then modify

### Phase 6: Export
1. `export_sprite` for single image (PNG with scale)
2. `export_spritesheet` for game engines (grid layout + JSON)
3. `export_sprite` with GIF format for animated preview

---

## Retro Palette Reference

### Console Palettes
| Name | Colors | Hex Values |
|------|--------|------------|
| **Game Boy** | 4 | `#0F380F`, `#306230`, `#8BAC0F`, `#9BBC0F` |
| **Game Boy Gray** | 4 | `#000000`, `#555555`, `#AAAAAA`, `#FFFFFF` |
| **NES** | 54 | Full NES palette (use `set_palette` with NES hex array) |
| **C64** | 16 | Commodore 64 palette |
| **CGA** | 4 | IBM CGA palette |
| **SNES** | 256 | Super Nintendo full palette |

### Modern Pixel Art Palettes
| Name | Colors | Description |
|------|--------|-------------|
| **PICO-8** | 16 | Fantasy console, very popular |
| **Sweetie 16** | 16 | Popular warm palette by GrafxKid |
| **DB16** | 16 | DawnBringer's 16 colors |
| **DB32** | 32 | DawnBringer's 32 colors |

### Generic
| Name | Colors |
|------|--------|
| **retro16** | 16 generic retro colors |
| **retro8** | 8 generic retro colors |
| **grayscale4/8/16** | Grayscale variants |

> 📋 Full palette hex values: see `resources/palettes.md`

---

## Dithering Patterns (16 Available)

| Category | Patterns |
|----------|----------|
| **Bayer (Ordered)** | bayer_2x2, bayer_4x4, bayer_8x8 |
| **Error Diffusion** | floyd_steinberg |
| **Simple** | checkerboard |
| **Textures** | grass, water, stone, cloud, brick, dots, diagonal, cross, noise, lines |

**When to use which:**
- **Bayer**: Retro aesthetic, regular patterns, backgrounds
- **Floyd-Steinberg**: Smooth gradients, natural images
- **Textures**: Specific material simulation
- **Checkerboard**: Quick 50% color mix

---

## Shading Quick Reference

| Style | Use When | Settings |
|-------|----------|----------|
| **Cell (Hard)** | Cartoon, bold sprites | `style: "hard"` |
| **Smooth** | Realistic, gradual lighting | `style: "smooth"` |
| **Soft (Pillow)** | Rounded objects, UI elements | `style: "soft"` |

**Light Directions:** top_left, top, top_right, left, right, bottom_left, bottom, bottom_right

**Best Practice:** Default to `top_left` light source, `intensity: 0.4`, `style: "smooth"`, `hue_shift: true`.

---

## Size Recommendations

| Use Case | Dimensions | Notes |
|----------|------------|-------|
| Icon | 16x16, 24x24, 32x32 | High contrast, simple shapes |
| Character Sprite | 32x32, 48x48, 64x64 | Room for detail + animation |
| Tile | 16x16, 32x32 | Must tile seamlessly |
| Mascot | 64x64, 128x128 | Detailed, personality |
| Scene / Background | 256x144, 320x180 | Retro resolution |
| Profile Avatar | 64x64, 128x128 | Circular crop friendly |

---

## Export Formats

| Format | Best For | Options |
|--------|----------|---------|
| **PNG** | Single frame, transparency | `scale`: 1x, 2x, 4x, 8x |
| **GIF** | Animated preview | `fps`, `loop` |
| **Spritesheet** | Game engines | Layout: horizontal, vertical, grid, packed |
| **JSON** | Game metadata | Compatible with: Aseprite, Unity, Godot, TexturePacker |

---

## Integration with Antigravity Ecosystem

### With visual-design-gate (Gate 2.5)
When designing UI that needs pixel art assets:
1. Use this skill to generate icons, sprites, or mascots
2. Export as PNG with appropriate scale
3. Reference exported files in design specifications

### With mascot-creator skill
Chain this skill for pixel-art style mascots:
1. mascot-creator defines character concept
2. aseprite-artist creates the pixel art version
3. Add animation states (idle, wave, blink)
4. Export transparent PNGs + animated GIF

### With project assets
When a project needs game-ready assets:
1. Create sprite with this skill
2. Export spritesheet + JSON metadata
3. Copy to project's assets directory
4. Reference in code (Compose, SwiftUI, React, etc.)

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| "Aseprite not found" | Wrong path in config | Update `~/.config/pixel-mcp/config.json` |
| "MCP server not responding" | Server not running | Restart pixel-mcp, check `bin/pixel-mcp --health` |
| "Export failed" | No sprite created | Create sprite first before exporting |
| "Cannot delete last layer" | Only one layer | Add another layer before deleting |
| "Palette index out of range" | Index > palette size | Check palette size with `get_palette` first |

---

## Anti-Patterns (AVOID)

- ❌ Drawing pixel-by-pixel for large areas → Use `fill_area` or `draw_rectangle`
- ❌ Using `set_palette` to convert colors → Use `quantize_palette` (it remaps pixels too)
- ❌ Antialiasing on 16x16 sprites → Too small, looks blurry
- ❌ Floyd-Steinberg on 4-color palette → Use Bayer for very limited palettes
- ❌ Pillow shading (light from all edges) → Pick one light direction
- ❌ Pure black shadows / pure white highlights → Use hue-shifted dark/light colors
