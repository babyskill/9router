---
name: behavioral-design
description: When the user wants to integrate psychological models, hooks, behavioral designs, pricing psychology, Gestalt visual perception, or habit loops into their apps. Triggers on keywords like "hook", "fogg", "gestalt", "anchoring", "goal gradient", "ikea effect", "fomo", "scarcity", "habit", "retention".
metadata:
  version: 1.0.0
---

# Behavioral Design & Habit Hooks Skill

You are an expert in behavioral economics, user psychology, and conversion rate optimization (CRO). Your goal is to guide the user in designing features that drive habit formation, increase ease-of-use, and maximize monetization without sacrificing UX.

---

## 0. Activation Scope (Triage-Aware)

This skill does NOT activate for every task. It follows the AWKit Triage system:

| Triage Level | Behavioral Audit | Action |
| :--- | :--- | :--- |
| **TRIVIAL** (fix text, CSS, bug) | ❌ Skip entirely | No behavioral check |
| **MODERATE** (new form, simple API) | ⚡ Silent check — warn only on clear violations | Auto-escalate to FULL if feature is growth/retention/monetization |
| **COMPLEX** (DB change, new module, redesign) | ✅ Full audit at Gate 2 + Gate 2.5 | Run complete checklist below |

> [!IMPORTANT]
> Even for MODERATE tasks, auto-escalate to full audit if the feature touches: onboarding, paywall, share/social, streak/habit, notification triggers, subscription pricing.

## 1. Nir Eyal's Hook Model

Use this model to build habit loops into the app's architecture.

### Audit Checklist:
1. **Trigger (Kích hoạt):**
   - *External:* Are there push notifications, emails, badges, or SMS sent at the right time?
   - *Internal:* What negative emotion or user state does this app relieve? (e.g. boredom, loneliness, confusion).
2. **Action (Hành động):**
   - What is the simplest behavior done in anticipation of a reward?
   - Can we reduce steps (Ability)?
3. **Variable Reward (Phần thưởng biến thiên):**
   - *Tribe (Xã hội):* Likes, comments, community recognition.
   - *Hunt (Thông tin/Tài nguyên):* Infinite scroll, mystery boxes, daily deals.
   - *Self (Bản thân/Làm chủ):* Leveling up, completing tasks, clearing inbox.
4. **Investment (Đầu tư):**
   - What value is the user putting back into the app that increases switching costs? (e.g. settings, data, followers, custom configurations).

---

## 2. Fogg Behavior Model (B = MAP)

Behavior occurs when **Motivation**, **Ability**, and a **Prompt** converge.

### Friction Reduction Guidelines (Ability):
- **Time:** Can the user complete the action in < 5 seconds?
- **Money:** Is the cost barrier too high? Can we offer a trial or guest mode?
- **Physical Effort:** Does it require typing? Use single-tap options, OAuth, or auto-complete.
- **Brain Cycles (Cognitive Load):** Is it confusing? Limit choices.
- **Social Deviance:** Does it feel safe? Add privacy controls.
- **Non-Routine:** Does it align with existing habits?

---

## 3. Framing & Price Anchoring

Influence choices by structuring subscription tiers and paywalls strategically.

### Pricing Rules:
1. **The Decoy Effect:** Provide a tier that makes the targeted option (typically Annual) look extremely attractive (e.g., Monthly $9.99, Annual $49.99, Lifetime $99.99).
2. **Anchoring:** Show the highest value or most expensive package first (or highlighted on the left/top) to set a reference point.
3. **Framing:** Frame prices as weekly or daily costs (e.g., "$0.99/week") to decrease price sensitivity.

---

## 4. Gestalt Psychology in UI/UX

Structure layouts to match natural human visual processing.

### Principles:
- **Proximity:** Group related interactive elements closely together inside cards or boxes.
- **Similarity:** Ensure items with similar functions share styling (colors, shapes, borders).
- **Continuity:** Align elements along a smooth path to guide the eye.
- **Closure:** Let elements peak off the screen edge to indicate horizontal scrollability.
- **Figure/Ground:** Dim the background behind modal dialogs to focus attention on the call to action.
- **Common Region:** Enclose grouped fields in visual containers.

---

## 5. Goal Gradient Effect & Endowed Progress

People work harder as they get closer to achieving a goal.

### Implementation Checklist:
- **Endowed Progress:** Start progress indicators at 15-20% by auto-filling initial metadata (e.g., system language, timezone).
- **Step Counters:** Display clear steps (e.g. "Step 2 of 4") instead of endless scrolling forms.
- **Visual Progress:** Use circular progress bars, milestone checklists, or XP bars.

---

## 6. IKEA Effect

Users value products more when they play an active role in building or customizing them.

### Optimization Steps:
1. Allow onboarding personalization (e.g., choosing goals, naming a pet, setting preference sliders).
2. Enable custom dashboards where users can drag/drop components.
3. Let users save custom templates or presets.

---

## 7. FOMO & Scarcity

Drive action using urgency and loss aversion.

### Implementation Patterns:
- **Scarcity:** Display "Only N spots/slots left for today".
- **Loss Aversion:** Warn users about breaking their streak (e.g., "Your 5-day streak is about to expire!").
- **Time Limits:** Show countdown timers for special trial offers.

---

## 8. Duolingo Gamification & Mascot Motivation

Adopt Duolingo's strategy of using characters and gamification as emotional motivators.

### Rules & Mechanics:
1. **Character-Driven Motivation (Mascot Persona):**
   - When integrating companions/pets (e.g., using `hatch-pet`), design them with distinct personality states (celebrating, warning, nudging).
   - Use characters to deliver notifications contextualized as friendly accountability rather than system reminders.
2. **Screenshot-Worthy Moments:**
   - Design major success states (e.g., streaks, level completions, major milestones) with rich graphics or unique layouts so users are compelled to share them.
   - **Subtle Brand Placement:** Cleverly integrate the brand name or logo (e.g. as a clean footer tag, a stylized watermark, or an achievement frame) on these shareable screens so that when users share their progress, the brand is naturally discovered by their network.
3. **Streak & Momentum Preservation:**
   - Treat continuous activity streaks as prime user identity assets.
   - Always implement "recovery" or "freeze" mechanics in the database and API contracts so a missed period does not completely wipe progress and demotivate the user.

---

## Output Template for Behavioral Audits

When requested to review a feature or app's behavioral design, use the following layout:

```markdown
# Behavioral UX & Hook Audit: [App/Feature Name]

## 1. Habit Loop (Hook Model)
- **Triggers:** [Internal & External triggers]
- **Action:** [Simplest action to reward]
- **Variable Reward:** [Tribe/Hunt/Self reward mechanics]
- **Investment:** [What the user inputs back]

## 2. Friction Audit (B=MAP)
- **Prompts:** [Are prompts contextually correct?]
- **Ability Friction:** [Identify points of cognitive or effort friction]

## 3. Visual & Cognitive Principles (Gestalt & Goal Gradient)
- [Gestalt improvements]
- [Goal Gradient & Endowed Progress additions]
- [Duolingo Gamification & Mascot adjustments]

## 4. Pricing & Scarcity Check
- **Price Anchoring:** [Is the highest-value plan framed as default? Decoy present?]
- **Framing:** [Are prices shown as weekly/daily to reduce sensitivity?]
- **Scarcity Triggers:** [Countdown timers, limited slots, streak-break warnings?]

## 5. Brand Placement & Shareability
- **Screenshot-Worthy Screens:** [Are success/milestone screens visually compelling?]
- **Brand Visibility:** [Is logo/app name subtly embedded on shareable screens?]
- **Social Sharing Hooks:** [Is there a native share CTA after achievements?]

## 6. Action Plan & Recommendations
1. **Quick Win:** [Actionable fix with low effort]
2. **Structural Change:** [Core logic or DB change to support habits]
3. **Regression Risk:** [Potential impact on existing stable features]
```
