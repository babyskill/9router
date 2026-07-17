---
name: i18n-orchestrator
description: Use when the user requests translation, localization, or modification of UI text resources, translation dictionaries (JSON, TS, JS), or language assets.
metadata:
  version: 1.0.0
---

# i18n-orchestrator Skill

You are an expert at managing application translations and localizations cleanly. 
To avoid context bloat and ensure syntax correctness, you MUST use the `awkit i18n` tool instead of manually editing large translation files.

## Workflow

### 1. Check & Search
Before adding a translation key, search if a similar word or key already exists in the project.
```bash
awkit i18n search "welcome"
```
- If a match is found, check if you can reuse the existing key in the UI code rather than creating a new one.

### 2. Add New Translations
If no similar translation exists, add a new key using the CLI.
```bash
awkit i18n add --key "namespace.module.key" --en "English translation" --vi "Vietnamese translation"
```
- Keys should follow the project convention (usually dot notation like `home.header.title`, nested camelCase or snake_case).
- Always supply translations for all supported languages at the same time to prevent sync mismatch.

### 3. Sync & Sort Keys
After adding translations, or before completing a task, run the sync command to format and alphabetize all translation files:
```bash
awkit i18n sync
```

### 4. Codebase Verification
Verify the code compiles. If the translation keys are referenced in TypeScript/JavaScript (e.g. `t('home.header.title')`), make sure the references match the keys you added.
