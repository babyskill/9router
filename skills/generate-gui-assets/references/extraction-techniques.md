# Extraction Techniques

## Approved Extraction Rule

When a source package says an extraction method is approved, do not recut, resegment, resize, or visually modify the source icons.

Allowed deterministic actions:

- Copy icons as-is into a flat `icons/` folder.
- Rename by semantic mapping.
- Add duplicate-safe suffixes such as `_2` and `_3`.
- Record full provenance in `icons_manifest.json`.

## When To Stop

Stop and ask for direction if:

- The source icon count does not match the semantic mapping.
- The source package includes mixed extraction methods and no approved technique is identified.
- The user asks for visual cleanup that would alter approved pixels.
- File names cannot be mapped deterministically to semantic names.
