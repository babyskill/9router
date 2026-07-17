---
name: expo-build-optimizer
description: Use when building Expo applications, tracking EAS build counts, optimizing free tier limits, or creating production APKs/IPAs.
---

# Expo Build Optimizer

## Overview
This skill enforces best practices and limits for Expo Free Tier development. It prevents exhausting the 30 EAS build limit per month by promoting local builds, Expo Go testing, and tracking usage. 

## When to Use
- When the user asks to build an Expo app (`eas build`).
- When checking Expo infrastructure limits.
- When there's a need to create an APK/IPA.

## Core Pattern
1. **No Automatic Builds:** Do NOT automatically run `awkit build` or `eas build` (local or remote) after completing a feature.
2. **Prioritize Expo Go & Metro:** Recommend Expo Go / Fast Refresh for real-time validation.
3. **Static Checks Only:** Use lightweight checks like `npx tsc --noEmit` (TypeScript validation) or linting commands in the verification phase instead of full native compilation.
4. **Always check limits first:** If a build is requested explicitly by the user, check `expo.builds` in `.project-identity` before running `eas build`.
5. **Use Local Build:** Suggest `eas build --local` as the primary alternative to server builds to save cloud quotas.
6. **Track Usage:** Every time an `eas build` (non-local) is performed, increment the `usedThisMonth` counter in `.project-identity`.

## Quick Reference
- **TypeScript Verification:** `npx tsc --noEmit`
- **Lint Verification:** `npm run lint` (or project equivalent)
- **Local Build Android:** `eas build -p android --profile production --local`
- **Local Build iOS:** `eas build -p ios --profile production --local` (Requires macOS)

## Implementation Steps
1. In Expo projects, ensure `.project-identity` configuration has `automation.build.enabled: false`.
2. Do NOT run build tasks automatically. When a task is completed, skip the build step and proceed directly to static checking (e.g., compile checks or lints).
3. If close to the EAS build limit (e.g., >25 builds in `.project-identity`), warn the user and suggest `--local`.
4. If building for simple UI/Logic testing, remind the user about Expo Go and fast refresh.
5. Emphasize that remote builds have a "Priority: Low" queue in the free tier, making `--local` the superior choice when hardware permits.
