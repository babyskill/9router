# Scene Prompt Template

```yaml
scene_id: SCENE_01
duration_seconds: 8
goal_of_scene: "Introduce conflict at the prep station"
visual_prompt: >
  [Describe composition, characters, action, environment details, and style]
camera_prompt: >
  [Shot type, lens feel, movement direction, framing priority]
continuity_from_previous: >
  [Explicit carry-over from prior scene: wardrobe, prop state, lighting]
negative_constraints:
  - "No extra characters"
  - "No wardrobe change"
  - "No prop position reset"
```

Prefer concrete language over abstract adjectives.
