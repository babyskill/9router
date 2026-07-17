# 📋 AWF Skill Catalog

> Classification of all skills by type, trigger, and priority.
> Updated: 2026-03-06

---

## Skill Types

| Type | Description | Example |
|------|-------------|---------|
| `auto` | Always active, runs silently without user command | `orchestrator`, `memory-sync` |
| `manual` | User must explicitly invoke via `/command` or keyword | `brainstorm-agent`, `ios-engineer` |

---

## Active Skills

| # | Skill | Type | Trigger | Priority | Version | Status |
|---|-------|------|---------|----------|---------|--------|
| 1 | `orchestrator` | `auto` | Always (first) | 1 | 2.1.0 | ✅ Active |
| 2 | `awf-session-restore` | `auto` | Session start | 2 | — | ✅ Active |
| 3 | `memory-sync` | `auto` | Always | 3 | 2.2.0 | ✅ Active |
| 4 | `symphony-orchestrator` | `auto` | Always | 4 | 1.0.0 | ✅ Active |
| 5 | `brainstorm-agent` | `manual` | `/brainstorm`, keywords | 5 | 1.0.0 | ✅ Active |
| 6 | `awf-error-translator` | `auto` | Error detected | 6 | — | ✅ Active |
| 7 | `awf-adaptive-language` | `auto` | Always | 7 | — | ✅ Active |
| 8 | `awf-caveman` | `auto` | `.project-identity` check | 7.5 | 1.0.1 | ✅ Active |
| 9 | `ios-engineer` | `manual` | iOS tasks | — | — | ✅ Active |
| 9 | `smali-to-kotlin` | `manual` | `/reverse-android` | 8 | — | ✅ Active |
| 10 | `smali-to-swift` | `manual` | `/reverse-ios` | 9 | — | ✅ Active |
| 11 | `awf-context-help` | `auto` | `/help`, stuck | — | — | ✅ Active |
| 12 | `auto-save` | `auto` | Session end | — | — | ✅ Background |
| 13 | `awf-version-tracker` | `auto` | Skill changes | — | — | ✅ Background |
| 14 | `module-spec-writer` | `auto` | Gate 1.5 check fail | 1.5 | 1.0.0 | ✅ Active |
| 15 | `spec-gate` | `auto` | Gate 2 check fail | 2 | 1.0.0 | ✅ Active |
| 16 | `visual-design-gate` | `auto` | Gate 2.5 check fail | 2.5 | 1.0.0 | ✅ Active |
| 17 | `trello-sync` | `auto` | Always | 2 | 3.0.0 | ✅ Active |
| 18 | `animal-island-ui-style` | `manual` | keywords (动物森友会, 可爱圆润 UI) | — | 1.0.0 | ✅ Active |
| 19 | `ios-visual-qa-strategist` | `manual` | iOS visual QA, simulator screenshots, minimal capture testing | — | 1.0.0 | ✅ Active |
| 20 | `ios-simulator-skill` | `manual` | iOS app building, testing, and simulator control | — | 1.5.0 | ✅ Active |
| 21 | `unity-game-development` | `manual` | Unity C# coding, ScriptableObjects, and profiling | — | 1.0.0 | ✅ Active |
| 22 | `godot-game-development` | `manual` | Godot 4 GDScript, composition and signal design | — | 1.0.0 | ✅ Active |
| 23 | `expo-game-development` | `manual` | Expo/React Native Skia/GL game loop optimization | — | 1.0.0 | ✅ Active |
| 24 | `ai-music` | `manual` | generate music, make a song, AI music, soundtrack, jingle, compose, inpaint music | — | 1.0.0 | ✅ Active |
| 25 | `game-developer` | `manual` | Unity, Unreal Engine, ECS architecture, game physics, multiplayer networking, shader programming, game AI | — | 1.1.0 | ✅ Active |
| 25.5 | `behavioral-design` | `manual` | `/behavior-audit`, hook, fogg, gestalt, anchoring, ikea effect, fomo, scarcity, habit, retention | — | 1.0.0 | ✅ Active |
| 25.5b | `onboarding-behavior-hook` | `manual` | onboarding hook, behavioral onboarding, ikea effect onboarding, paywall | — | 1.0.0 | ✅ Active |
| 25.6 | `game-design` | `manual` | game design, gamification, Duolingo-like loops, quests, streaks, rewards, difficulty curves, player psychology | — | 1.0.0 | Optional pack |
| 25.7 | `text-to-lottie` | `manual` | Lottie/Bodymovin JSON animations, text-to-Lottie, SVG/logo/type animation, loaders/icons, state feedback, UI microinteractions | — | 1.0.0 | ✅ Active |
| 50 | `svg-animations` | `manual` | SVG graphics, icons, illustrations, animated logos, path animations, morphing shapes, loading spinners, SMIL/CSS animations, motion paths, gradients, masks, filters | — | 1.0.0 | ✅ Active |
| 51 | `ad-optimization` | `manual` | admob, banner, interstitial, nativead, rewarded ad, app open ad, preload ad, paywall, ad campaign | — | 1.0.0 | ✅ Active |
| 52 | `better-icons` | `manual` | icons, search icons, get icon, recommend icons, sync icon, svg icon, better-icons | — | 1.0.0 | ✅ Active |
| 53 | `ask-me-about` | `manual` | ask-me-about | — | 1.0.0 | ✅ Active |
| 54 | `brainstorm` | `manual` | brainstorm | — | 1.0.0 | ✅ Active |
| 55 | `competing-hypotheses` | `manual` | competing-hypotheses | — | 1.0.0 | ✅ Active |
| 56 | `create-profile-atlas` | `manual` | create-profile-atlas | — | 1.0.0 | ✅ Active |
| 57 | `dotfiles-mac` | `manual` | dotfiles-mac | — | 1.0.0 | ✅ Active |
| 58 | `image-to-svg` | `manual` | image-to-svg | — | 1.0.0 | ✅ Active |
| 59 | `improve-code-structure` | `manual` | improve-code-structure | — | 1.0.0 | ✅ Active |
| 60 | `multi-review` | `manual` | multi-review | — | 1.0.0 | ✅ Active |
| 61 | `orchestrate-subagents` | `manual` | orchestrate-subagents | — | 1.0.0 | ✅ Active |
| 62 | `pr-issue-review` | `manual` | pr-issue-review | — | 1.0.0 | ✅ Active |
| 63 | `quotespeak` | `manual` | quotespeak | — | 1.0.0 | ✅ Active |
| 64 | `repeat-until-settled` | `manual` | repeat-until-settled | — | 1.0.0 | ✅ Active |
| 65 | `restack` | `manual` | restack | — | 1.0.0 | ✅ Active |
| 66 | `seam-audit` | `manual` | seam-audit | — | 1.0.0 | ✅ Active |
| 67 | `sync-fork` | `manual` | sync-fork | — | 1.0.0 | ✅ Active |
| 68 | `team-solve` | `manual` | team-solve | — | 1.0.0 | ✅ Active |
| 69 | `use-claude` | `manual` | use-claude | — | 1.0.0 | ✅ Active |
| 70 | `use-codex` | `manual` | use-codex | — | 1.0.0 | ✅ Active |
| 71 | `agent-browser` | `manual` | agent-browser | — | 1.0.0 | ✅ Active |
| 72 | `agent-tower-plugin` | `manual` | agent-tower-plugin | — | 1.0.0 | ✅ Active |
| 73 | `biz-email-writer` | `manual` | biz-email-writer | — | 1.0.0 | ✅ Active |
| 74 | `data-report-generator` | `manual` | data-report-generator | — | 1.0.0 | ✅ Active |
| 75 | `day1-onboarding` | `manual` | day1-onboarding | — | 1.0.0 | ✅ Active |
| 76 | `day2-create-context-sync-skill` | `manual` | day2-create-context-sync-skill | — | 1.0.0 | ✅ Active |
| 77 | `day2-supplement-mcp` | `manual` | day2-supplement-mcp | — | 1.0.0 | ✅ Active |
| 78 | `day4-wrap-and-analyze` | `manual` | day4-wrap-and-analyze | — | 1.0.0 | ✅ Active |
| 79 | `day5-fetch-and-digest` | `manual` | day5-fetch-and-digest | — | 1.0.0 | ✅ Active |
| 80 | `design-md` | `manual` | design-md | — | 1.0.0 | ✅ Active |
| 81 | `docx` | `manual` | docx | — | 1.0.0 | ✅ Active |
| 82 | `excel-automation` | `manual` | excel-automation | — | 1.0.0 | ✅ Active |
| 83 | `find-skills` | `manual` | find-skills | — | 1.0.0 | ✅ Active |
| 84 | `gowid-expense` | `manual` | 경비, 미제출, 내 경비, 경비 제출, 고위드, gowid | — | 1.0.0 | ✅ Active |
| 85 | `hwpx` | `manual` | hwpx | — | 1.0.0 | ✅ Active |
| 86 | `korean-biz-docs` | `manual` | korean-biz-docs | — | 1.0.0 | ✅ Active |
| 87 | `korean-translator` | `manual` | korean-translator | — | 1.0.0 | ✅ Active |
| 88 | `meeting-minutes` | `manual` | meeting-minutes | — | 1.0.0 | ✅ Active |
| 89 | `my-cash-position` | `manual` | 캐시, cash, 잔액, cash position, 현금 | — | 1.0.0 | ✅ Active |
| 90 | `my-code-reviewer` | `manual` | my-code-reviewer | — | 1.0.0 | ✅ Active |
| 91 | `my-consult` | `manual` | my-consult | — | 1.0.0 | ✅ Active |
| 92 | `my-content-digest` | `manual` | 콘텐츠 소화, 퀴즈, 학습, digest | — | 1.0.0 | ✅ Active |
| 93 | `my-context-sync` | `manual` | 싱크, sync, 정보 수집, 컨텍스트 싱크 | — | 1.0.0 | ✅ Active |
| 94 | `my-contract-review` | `manual` | my-contract-review | — | 1.0.0 | ✅ Active |
| 95 | `my-design-grade` | `manual` | my-design-grade | — | 1.0.0 | ✅ Active |
| 96 | `my-dev-team` | `manual` | my-dev-team | — | 1.0.0 | ✅ Active |
| 97 | `my-docs-sync` | `manual` | my-docs-sync | — | 1.0.0 | ✅ Active |
| 98 | `my-eo-contract-drafter` | `manual` | my-eo-contract-drafter | — | 1.0.0 | ✅ Active |
| 99 | `my-fetch-tweet` | `manual` | 트윗 번역, 트윗 가져와, X 게시글 | — | 1.0.0 | ✅ Active |
| 100 | `my-fetch-youtube` | `manual` | 유튜브 번역, 영상 정리, YouTube 요약 | — | 1.0.0 | ✅ Active |
| 101 | `my-finance-advisor` | `manual` | my-finance-advisor | — | 1.0.0 | ✅ Active |
| 102 | `my-gmail-attachment-extractor` | `manual` | my-gmail-attachment-extractor | — | 1.0.0 | ✅ Active |
| 103 | `my-history-insight` | `manual` | my-history-insight | — | 1.0.0 | ✅ Active |
| 104 | `my-homework-new` | `manual` | my-homework-new | — | 1.0.0 | ✅ Active |
| 105 | `my-legal-advisor` | `manual` | my-legal-advisor | — | 1.0.0 | ✅ Active |
| 106 | `my-legal-email-analyzer` | `manual` | my-legal-email-analyzer | — | 1.0.0 | ✅ Active |
| 107 | `my-legal-researcher` | `manual` | 법령 검색, 판례 찾아줘, 법적으로 어떻게, 법적 검토, /legal-research, 법률 리서치, 법 조항 | — | 1.0.0 | ✅ Active |
| 108 | `my-meeting-digest` | `manual` | 미팅 정리, 미팅 자산화, meeting digest, 노트 정리, 회의 정리 | — | 1.0.0 | ✅ Active |
| 109 | `my-session-analyzer` | `manual` | my-session-analyzer | — | 1.0.0 | ✅ Active |
| 110 | `my-session-wrap` | `manual` | my-session-wrap | — | 1.0.0 | ✅ Active |
| 111 | `my-sync-us-revenue` | `manual` | 미국 매출, US revenue, 입금 확인, sync revenue, 미입금, 매출 동기화 | — | 1.0.0 | ✅ Active |
| 112 | `my-team-setup` | `manual` | 팀 셋업, team setup, 클로드 설치, MCP 설정, 온보딩 | — | 1.0.0 | ✅ Active |
| 113 | `my-townhall-agency` | `manual` | my-townhall-agency | — | 1.0.0 | ✅ Active |
| 114 | `opusplan` | `manual` | opusplan | — | 1.0.0 | ✅ Active |
| 115 | `pdf` | `manual` | pdf | — | 1.0.0 | ✅ Active |
| 116 | `plan-first` | `manual` | /plan, /plan-first, 계획 세워줘, 작업 계획, 시작 전에 정리, 계획부터 | — | 1.0.0 | ✅ Active |
| 117 | `portfolio-builder` | `manual` | portfolio-builder | — | 1.0.0 | ✅ Active |
| 118 | `ppt-design-system` | `manual` | ppt-design-system | — | 1.0.0 | ✅ Active |
| 119 | `pptx` | `manual` | pptx | — | 1.0.0 | ✅ Active |
| 120 | `project-tracker` | `manual` | project-tracker | — | 1.0.0 | ✅ Active |
| 121 | `prompt-engineer` | `manual` | prompt-engineer | — | 1.0.0 | ✅ Active |
| 122 | `proposal-maker` | `manual` | proposal-maker | — | 1.0.0 | ✅ Active |
| 123 | `ralph-loop` | `manual` | /ralph-loop, ralph loop, ralph-loop, 반복 개발, 자율 루프 | — | 1.0.0 | ✅ Active |
| 124 | `slack-to-gcal` | `manual` | slack-to-gcal | — | 1.0.0 | ✅ Active |
| 125 | `svg-diagram` | `manual` | svg-diagram | — | 1.0.0 | ✅ Active |
| 126 | `vercel-react-best-practices` | `manual` | vercel-react-best-practices | — | 1.0.0 | ✅ Active |
| 127 | `web-design-guidelines` | `manual` | web-design-guidelines | — | 1.0.0 | ✅ Active |
| 128 | `worktree` | `manual` | worktree, 워크트리, 세션 격리, 병렬 세션, wt-new, wt-ls, wt-done | — | 1.0.0 | ✅ Active |
| 129 | `xlsx` | `manual` | xlsx | — | 1.0.0 | ✅ Active |
| 130 | `animation-vocabulary` | `manual` | animation-vocabulary | — | 1.0.0 | ✅ Active |
| 131 | `apple-design` | `manual` | apple-design | — | 1.0.0 | ✅ Active |
| 132 | `emil-design-eng` | `manual` | emil-design-eng | — | 1.0.0 | ✅ Active |
| 133 | `review-animations` | `manual` | review-animations | — | 1.0.0 | ✅ Active |
| 134 | `audit-xcode-security-settings` | `manual` | xcode-security-settings, audit-xcode-security-settings, xcode security | — | 1.0.0 | ✅ Active |
| 135 | `c-bounds-safety` | `manual` | bounds-safety, c-bounds-safety, -fbounds-safety | — | 1.0.0 | ✅ Active |
| 136 | `device-interaction` | `manual` | device-interaction, iOS device testing, simulator interaction, verify on device | — | 1.0.0 | ✅ Active |
| 137 | `swiftui-specialist` | `manual` | SwiftUI, swiftui, swiftui-specialist, idiomatic SwiftUI | — | 1.0.0 | ✅ Active |
| 138 | `swiftui-whats-new-27` | `manual` | SwiftUI, iOS 27, Xcode 27, swiftui-whats-new-27 | — | 1.0.0 | ✅ Active |
| 139 | `test-modernizer` | `manual` | Swift Testing, test-modernizer, swift-testing, XCTest migration | — | 1.0.0 | ✅ Active |
| 140 | `uikit-app-modernization` | `manual` | UIKit, uikit, uikit-app-modernization, scene lifecycle | — | 1.0.0 | ✅ Active |
| 141 | `react-native-best-practices` | `manual` | react-native-best-practices, react native, expo, gestures, worklets | — | 1.0.0 | ✅ Active |

---

## Ponytail (Code Minimalism)

> Adapted from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) (MIT).
> Enforces lazy senior dev coding: YAGNI, stdlib/native first, no unrequested abstractions.

| # | Skill | Type | Trigger | Priority | Version | Status |
|---|-------|------|---------|----------|---------|--------|
| 26 | `awf-ponytail` | `auto` | `.project-identity` check (default ON) | 7.6 | 1.0.0 | ✅ Active |
| 27 | `awf-ponytail-review` | `manual` | `/ponytail-review`, "what can we delete", Gate 5 | — | 1.0.0 | ✅ Active |

---

## Quality & Discipline Skills (Superpowers-Inspired)

> Skills ported and adapted from [obra/superpowers](https://github.com/obra/superpowers) framework.
> Integrated into AWKit with NeuralMemory + Symphony extensions.

| # | Skill | Type | Trigger | Priority | Status |
|---|-------|------|---------|----------|--------|
| 14 | `verification-gate` | `auto` | Task completion, commit, deploy | 1 | ✅ Active |
| 15 | `systematic-debugging` | `auto` | `/debug`, error detected, test failures | 2 | ✅ Active |
| 16 | `review` | `auto` | Task completion, before merge | 3 | ✅ Active |
| 17 | `writing-skills` | `manual` | Creating/modifying skills | — | ✅ Active |


---

## NeuralMemory Skill Pack (Optional Upgrade)

When NeuralMemory is installed, these skills provide enhanced capabilities:

| # | Skill | Type | Replaces | Trigger |
|---|-------|------|----------|---------|
| 1 | `nm-memory-sync` | `auto` | `memory-sync` | Session start, debug, errors |
| 2 | `nm-memory-intake` | `manual` | — | `/memory-intake` |
| 3 | `nm-memory-audit` | `manual` | — | `/memory-audit` |
| 4 | `nm-memory-evolution` | `manual` | — | `/memory-evolution` |

---

## Self-Evolution Skills

Skills marked with self-evolution have a `## Learnings` section that accumulates insights:

- ✅ `orchestrator` — routing improvements
- ✅ `memory-sync` — trigger pattern refinements
- ✅ `symphony-orchestrator` — task management optimizations

---

## Removed (Legacy Duplicates)

These were deleted in v2.2 cleanup — canonical versions are listed above:

| Removed | Replaced By | Reason |
|---------|------------|--------|
| `ambient-brain/` | `memory-sync/` | v1.0 → v2.2 upgrade |
| `adaptive-language/` | `awf-adaptive-language/` | Naming standardization |
| `context-help/` | `awf-context-help/` | Naming standardization |
| `error-translator/` | `awf-error-translator/` | Naming standardization |
| `session-restore/` | `awf-session-restore/` | Naming standardization |
| `beads-manager/` | `symphony-orchestrator/` | Migrated to Symphony for task management |
