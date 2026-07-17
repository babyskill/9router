# Aseprite Artist — Example Workflows

## Example 1: Game Boy Character Sprite

**Request:** "Tạo một character sprite Game Boy 48x48"

**Steps:**
1. Create 48x48 Indexed canvas
2. Set Game Boy palette: `["#0F380F", "#306230", "#8BAC0F", "#9BBC0F"]`
3. Add layers: "Background", "Character", "Details"
4. Draw character silhouette on Character layer
5. Add details (eyes, mouth, accessories)
6. Export as PNG at 4x scale

**MCP Calls:**
```
create_canvas(width: 48, height: 48, color_mode: "Indexed")
set_palette(colors: ["#0F380F", "#306230", "#8BAC0F", "#9BBC0F"])
add_layer(name: "Background")
add_layer(name: "Character")
add_layer(name: "Details")
# ... drawing operations ...
export_sprite(format: "png", scale: 4, output_path: "character.png")
```

---

## Example 2: Animated Idle Mascot

**Request:** "Tạo mascot 64x64 với animation idle 4 frames"

**Steps:**
1. Create 64x64 RGB canvas
2. Draw mascot character on frame 1
3. Duplicate frame → make subtle breathing motion (frame 2)
4. Duplicate frame 1 → neutral pose (frame 3)
5. Duplicate frame → opposite breathing (frame 4)
6. Set frame durations to 150ms each
7. Create "idle" animation tag
8. Export as GIF

**MCP Calls:**
```
create_canvas(width: 64, height: 64, color_mode: "RGB")
# Draw mascot on frame 1...
duplicate_frame(frame: 1)
# Modify frame 2 (slightly expand body 1px)
duplicate_frame(frame: 1)
# Frame 3 stays neutral
duplicate_frame(frame: 2)
# Frame 4 mirror of frame 2
set_frame_duration(frame: 1, duration: 150)
set_frame_duration(frame: 2, duration: 150)
set_frame_duration(frame: 3, duration: 150)
set_frame_duration(frame: 4, duration: 150)
create_tag(name: "idle", from_frame: 1, to_frame: 4)
export_sprite(format: "gif", output_path: "mascot-idle.gif")
```

---

## Example 3: NES-Style Game Tile

**Request:** "Tạo tile brick wall 16x16 NES style"

**Steps:**
1. Create 16x16 Indexed canvas
2. Set NES brick colors (subset of NES palette)
3. Draw brick pattern (3 rows of offset rectangles)
4. Apply Bayer 2x2 dithering for mortar texture
5. Export at 4x scale

**MCP Calls:**
```
create_canvas(width: 16, height: 16, color_mode: "Indexed")
set_palette(colors: ["#000000", "#882400", "#A81000", "#F87858", "#FCA044"])
draw_rectangle(x: 0, y: 0, w: 16, h: 16, color: "#A81000", filled: true)
# Draw brick lines and mortar...
draw_with_dither(pattern: "bayer_2x2", color1: "#A81000", color2: "#882400", region: {...})
export_sprite(format: "png", scale: 4, output_path: "brick-tile.png")
```

---

## Example 4: Modern Sword with Shading

**Request:** "Vẽ thanh kiếm pixel art 64x64 với shading"

**Steps:**
1. Create 64x64 RGB canvas
2. Draw blade silhouette (silver/white triangular shape)
3. Draw hilt (gold rectangle + guard)
4. Apply auto-shading from top-left
5. Add antialiasing to blade edges
6. Export at 2x scale

**MCP Calls:**
```
create_canvas(width: 64, height: 64, color_mode: "RGB")
add_layer(name: "Blade")
add_layer(name: "Hilt")
# Draw blade shape...
# Draw hilt shape...
apply_auto_shading(light_direction: "top_left", intensity: 0.5, style: "smooth", hue_shift: true)
suggest_antialiasing(auto_apply: true)
export_sprite(format: "png", scale: 2, output_path: "sword.png")
```

---

## Example 5: Spritesheet for Unity

**Request:** "Tạo character 32x32 PICO-8 với 8-frame run cycle, export cho Unity"

**Steps:**
1. Create 32x32 Indexed canvas
2. Set PICO-8 palette
3. Draw character pose frame 1
4. Create 7 more frames for run cycle
5. Set frame durations to 80ms
6. Tag as "run"
7. Export spritesheet (grid layout) + JSON metadata

**MCP Calls:**
```
create_canvas(width: 32, height: 32, color_mode: "Indexed")
set_palette(colors: ["#000000", "#1D2B53", "#7E2553", ...PICO-8 full palette...])
# Draw frame 1 (neutral standing)
# Add frames 2-8 with progressive leg/arm positions
create_tag(name: "run", from_frame: 1, to_frame: 8)
set_frame_duration(frame: 1, duration: 80)  # repeat for all frames
export_spritesheet(
  layout: "grid",
  output_path: "character-run.png",
  json_path: "character-run.json",
  json_format: "unity"
)
```

---

## Example 6: App Icon from Reference Image

**Request:** "Chuyển logo này thành pixel art icon 32x32"

**Steps:**
1. Import reference image
2. Analyze reference (extract palette, brightness map)
3. Downsample to 32x32
4. Quantize to 16 colors
5. Clean up edges manually
6. Export at multiple scales (1x, 2x, 4x)

**MCP Calls:**
```
import_image(path: "logo.png")
analyze_reference(path: "logo.png", analyses: ["palette", "brightness"])
downsample_image(target_width: 32, target_height: 32)
quantize_palette(target_colors: 16, algorithm: "k_means", dither: false)
# Manual cleanup with draw_pixels...
export_sprite(format: "png", scale: 1, output_path: "icon-1x.png")
export_sprite(format: "png", scale: 2, output_path: "icon-2x.png")
export_sprite(format: "png", scale: 4, output_path: "icon-4x.png")
```

---

## Example 7: Texture Dithering

**Request:** "Tạo texture stone wall 32x32 với dithering"

**Steps:**
1. Create 32x32 RGB canvas
2. Set stone color palette (browns, grays)
3. Draw base stone shapes
4. Apply stone dithering texture
5. Add depth with Bayer 4x4 dithering
6. Export as tileable PNG

**MCP Calls:**
```
create_canvas(width: 32, height: 32, color_mode: "RGB")
set_palette(colors: ["#333333", "#555555", "#777777", "#999999", "#666644"])
# Draw stone block shapes...
draw_with_dither(pattern: "stone", color1: "#555555", color2: "#777777", region: {...})
draw_with_dither(pattern: "bayer_4x4", color1: "#333333", color2: "#555555", region: {...})
export_sprite(format: "png", scale: 2, output_path: "stone-wall.png")
```
