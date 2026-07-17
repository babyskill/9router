# TDD for Skills: RED-GREEN-REFACTOR + Testing Methodology

## The Iron Law (Same as TDD)

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to NEW skills AND EDITS to existing skills. No exceptions — not for "simple additions", "just adding a section", or "documentation updates".

## RED: Write Failing Test (Baseline)

Run pressure scenario WITHOUT the skill. Document exact behavior:
- What choices did they make?
- What rationalizations did they use (verbatim)?
- Which pressures triggered violations?

## GREEN: Write Minimal Skill

Write skill addressing those specific rationalizations. Don't add extra content for hypothetical cases.

Run same scenarios WITH skill. Agent should now comply.

## REFACTOR: Close Loopholes

Agent found new rationalization? Add explicit counter. Re-test until bulletproof.

If you need a deeper validation harness, keep it in a separate reference file instead of inflating `SKILL.md`.

---

## Testing All Skill Types

### Discipline-Enforcing Skills (rules/requirements)
- Test with: Academic questions, pressure scenarios, combined pressures
- Success: Agent follows rule under maximum pressure

### Technique Skills (how-to guides)
- Test with: Application scenarios, variation scenarios, missing info tests
- Success: Agent successfully applies technique to new scenario

### Pattern Skills (mental models)
- Test with: Recognition scenarios, application, counter-examples
- Success: Agent correctly identifies when/how to apply pattern

### Reference Skills (documentation/APIs)
- Test with: Retrieval scenarios, application, gap testing
- Success: Agent finds and correctly applies reference information

---

## Common Rationalizations for Skipping Testing

| Excuse | Reality |
|--------|---------|
| "Skill is obviously clear" | Clear to you ≠ clear to other agents. Test it. |
| "It's just a reference" | References can have gaps. Test retrieval. |
| "Testing is overkill" | Untested skills have issues. Always. |
| "I'll test if problems emerge" | Problems = agents can't use skill. Test BEFORE. |
| "Too tedious to test" | Less tedious than debugging bad skill in production. |
| "I'm confident it's good" | Overconfidence guarantees issues. Test anyway. |

**All of these mean: Test before deploying. No exceptions.**
