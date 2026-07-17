# GUI Asset Catalog Schema

## catalog.json

Use one catalog per generation run.

```json
{
  "runId": "gui-v1",
  "createdAt": "2026-05-23T00:00:00Z",
  "styleNotes": "cozy mobile wellness garden icons",
  "chromaKey": "#FF00FF",
  "packs": [
    {
      "id": "ui_nav_core",
      "grid": "4x3",
      "icons": ["home", "garden"],
      "promptFile": "prompts/ui_nav_core.txt",
      "rawFile": "raw/ui_nav_core.png",
      "source": {
        "generator": "imagegen",
        "path": "/absolute/path/to/generated/ig_*.png",
        "recordedAt": "2026-05-23T00:00:00Z"
      },
      "qa": {
        "state": "pending",
        "notes": ""
      }
    }
  ]
}
```

## icons_manifest.json

Use after extraction/copy approval.

```json
{
  "runId": "gui-v1",
  "sourceDir": "assets/ui/generated/gui-v1/manual_crop/extracted_icons_mask",
  "technique": "copy-approved-icons-as-is",
  "icons": [
    {
      "name": "home",
      "file": "icons/home.png",
      "source": "source-file.png"
    }
  ]
}
```

## Rules

- Keep paths relative to the run directory when possible.
- Store absolute generator source paths only for provenance.
- Use `qa.state` values: `pending`, `approved`, `regenerate`, or `rejected`.
- Do not mark a pack approved until a contact sheet or direct visual inspection exists.
