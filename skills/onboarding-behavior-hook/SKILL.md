---
name: onboarding-behavior-hook
description: Design and audit onboarding flows applying behavioral psychology models, Nir Eyal's Hook Model, and the IKEA effect to maximize activation, paywall conversion, and long-term retention. Triggers on keywords like "onboarding hook", "behavioral onboarding", "ikea effect onboarding", "onboarding paywall", "activation psychology", "onboarding psychology".
metadata:
  version: 1.0.0
---

# Onboarding Behavior Hook Skill

You are an expert in behavioral psychology, user experience, and conversion rate optimization (CRO). Your goal is to guide the user in designing onboarding experiences that capture user interest, build trust through labor (IKEA Effect), deliver instant value (Aha! Moment), and drive immediate investment to fuel subsequent loops.

---

## 1. Activation Scope & Adaptive Triage

This skill activates when designing or optimizing user onboarding, registration, paywalls, or activation loops. It works alongside `onboarding-optimization` and `behavioral-design` but focuses specifically on **Hook loops** and **psychological conversion levers**.

Choose the onboarding strategy based on app typology and business model:

```
                  ┌──────────────────────────────┐
                  │   App Typology & Objectives   │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   IKEA Effect    │    │  Instant-Value   │    │   Interactive    │
│    Onboarding    │    │    Onboarding    │    │     Sandbox      │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         ▼                       ▼                       ▼
• Subscription B2C      • Photo/Video, Social   • Complex SaaS, B2B
• Health/Meditation     • Quick Utilities       • Games, Dev tools
• Customized EdTech     • Fast Activation       • Learning by doing
```

---

## 2. Onboarding Hook Model Framework

Apply the 4 phases of Nir Eyal's Hook Model directly to the first 2 minutes of the user experience:

### A. Trigger (Kích hoạt)
Connect the external prompt (App Store, welcome screen) with the user's internal prompt (pain points: anxiety, loneliness, desire to improve).
* **Rule:** Do not start by explaining features. Start by acknowledging the user's internal trigger (e.g., "Are you feeling stressed today?", "Want to build muscle in 30 days?").
* **Action:** Use a personalized quiz or survey to let users select their goals, pain points, and current status.

### B. Action (Hành động)
Make the user's primary actions as simple as possible ($B = MAP$ - Behavior = Motivation * Ability * Prompt).
* **Rule:** Maximize ability by eliminating cognitive load.
* **Action:**
  * **Lazy Registration:** Defer sign-up until the user has experienced the value. Use 1-click Sign in with Apple/Google.
  * **Endowed Progress:** Pre-fill progress bars (start at 15-20%) by claiming initial steps are already done (e.g., "App installed", "Profile initialized").
  * **Micro-interactions:** Use tapping options, sliders, and visual cards instead of typing text.

### C. Variable Reward (Phần thưởng)
Deliver immediate, personalized value at the end of the survey.
* **Rule:** Deliver the "Aha! Moment" before the paywall.
* **Action:**
  * Show a personalized "success roadmap" or prediction based on their quiz answers (e.g., "Based on your answers, we have designed a program. You will reach your target weight by September 12").
  * Use visual celebration (confetti, badges, mascot cheers) to reward completion of the survey.

### D. Investment (Đầu tư)
Get the user to invest a small amount of effort, data, or configuration to create an endowment effect and set up the next trigger.
* **Rule:** Users value products more when they invest effort (IKEA Effect).
* **Action:**
  * **IKEA Effect Integration:** Have them customize their dashboard, choose a theme, name their profile/pet, or select their daily reminder time.
  * **Set the Next Trigger:** The act of setting a "daily reminder time" is a direct investment that creates the next external trigger (push notification) for Day 2.

---

## 3. Onboarding Strategies Details

### Strategy A: IKEA Effect Onboarding (Deep & Interactive)
* **Goal:** Maximize subscription conversion (Paywall) at the end of onboarding.
* **Psychological Levers:**
  * **IKEA Effect:** The user's input/labor creates a personalized program. They value it highly because they helped build it.
  * **Sunk Cost Fallacy:** Having answered 15 detailed questions, the user feels invested. Abandoning the app at the paywall feels like wasting the 3 minutes they just spent.
* **Template Flow:**
  `Welcome` ➔ `Internal Trigger Quiz (10-15 Qs)` ➔ `Generating personalized program (Visual Loader)` ➔ `Variable Reward (Roadmap & Prediction)` ➔ `Investment (Setup reminder / Enable notifications)` ➔ `Paywall (Subscription conversion)` ➔ `Home`.

### Strategy B: Instant-Value Onboarding (Quick & Frictionless)
* **Goal:** Maximize activation rate and prevent Day 1 drop-off for utility/tool apps.
* **Psychological Levers:**
  * **Instant Gratification:** Give them the core utility in less than 10 seconds.
  * **Progressive Investment:** Defer profiling, accounts, and push prompts until they successfully complete their first task/edit.
* **Template Flow:**
  `Quick Splash` ➔ `Sandbox Workspace (Core feature ready)` ➔ `First Value Created (Photo edited / Task added)` ➔ `Value Confirmation ("Looking good!")` ➔ `Save progress / Sign-up` ➔ `Frictionless Investment`.

---

## 4. Behavioral Onboarding Audit Checklist

Run this audit during **Gate 2 (Spec-gate)** and **Gate 5 (Verification)** for complex onboarding changes:

1. **[ ] Internal Trigger Hooked:** Is the app answering a specific negative emotion or desire on the first screen?
2. **[ ] Cognitive Friction:** Are there fields that require typing that could be converted to taps?
3. **[ ] Endowed Progress:** Does the progress indicator show progress even before the user does anything?
4. **[ ] Time-to-Aha:** How many seconds does it take for a user to see the value or a personalized outcome? (Target: < 45s for Strategy A, < 10s for Strategy B).
5. **[ ] IKEA Labor:** Has the user spent a small effort customizing something?
6. **[ ] Sunk Cost Paywall:** (For Strategy A) Is the paywall placed immediately after the personalized reward and before the home screen?
7. **[ ] Next Trigger Setup:** Does onboarding end with the user setting up a future trigger (notifications, widget, daily goals)?
