---
description: Query NeuralMemory với associative recall (spreading activation)
---

# /nm-recall — NeuralMemory Associative Recall

## When to use
- Cần tìm lại quyết định, lỗi, hoặc patterns từ past sessions
- Regular recall không đủ — cần associative links
- Muốn surface hidden connections giữa các memories

## Steps

1. **Extract query keywords** từ user's question
   - Lấy 3-5 keywords cốt lõi
   - Bỏ qua stop words

2. **Run activating recall**
   ```
   nmem_recall(query, depth=2)
   ```
   - `depth=1`: Instant recall — direct matches only
   - `depth=2`: Context recall — + 1 hop via synapses (default)
   - `depth=3`: Deep recall — use for complex architecture questions

3. **Format recall results**
   ```
   🧠 Recalled [N] memories for: "[query]"
   
   [type] "[content excerpt]"
   → Tags: [tags] | Priority: [P] | Age: [X days]
   → Connected to: [related memory brief] via [synapse_type]
   
   [type] "[content excerpt]"
   ...
   ```

4. **Surface connections**
   - Highlight `CAUSED_BY`, `LEADS_TO`, `DISCUSSED` links
   - Show causal chains when relevant: A → caused → B → leads to → C

5. **If no results (depth=2)**
   - Try `depth=3` automatically
   - If still empty: "🧠 No relevant memories found. Consider /nm-intake to capture this."

## Output Examples

```
🧠 Recalled 3 memories for: "auth JWT"

[decision] "Chose JWT over sessions for stateless API auth"
→ Tags: [auth, jwt, api, decision] | Priority: 8 | Age: 14 days
→ Caused by: "Need to support mobile + web clients simultaneously"
→ Leads to: "JWT stored in Authorization header, 24h expiry"

[error] "Fixed: JWT middleware running before auth check caused 401 on valid tokens"
→ Tags: [auth, jwt, middleware, error] | Priority: 7 | Age: 5 days
→ Solution: "Reorder middleware: auth check → JWT verify → route handler"

[instruction] "Never store JWT in localStorage — XSS vulnerability"
→ Tags: [auth, security, jwt, instruction] | Priority: 9 | Age: 30 days
```

## Anti-patterns
- Do NOT just keyword search — use NeuralMemory's associative engine
- Do NOT show all memories — only top activations (max 8)
- Do NOT skip connections — the synapse links ARE the value
