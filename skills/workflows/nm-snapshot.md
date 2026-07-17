---
description: Export NeuralMemory brain state to JSON snapshot (portable consciousness)
---

# /nm-snapshot — Brain Snapshot Export

## When to use
- Trước khi switch AI tools hoặc agents
- Backup trước sprint hoặc major refactor
- Share brain với teammate/agent
- "Portable Consciousness" — export & re-import vào agent khác

## Steps

### Step 1: Choose snapshot scope
```
Snapshot scope:
  a) Full brain — all memories + synapses
  b) Topic scope — memories matching [topic]
  c) Recent — memories from last [N] days
  d) High priority — priority >= 7 only

[Choose scope]
```

### Step 2: Generate snapshot
```python
# Export to JSON
snapshot = {
  "version": "1.0",
  "exported_at": "2026-02-26T12:00:00Z",
  "project": "<from .project-identity>",
  "scope": "<chosen scope>",
  "memories": [...],
  "synapses": [...],
  "stats": {
    "total_memories": N,
    "total_synapses": N,
    "avg_priority": X.X
  }
}
```

### Step 3: Save + report
```
✅ Snapshot saved: brain_snapshot_2026-02-26.json

  Memories: 127
  Synapses: 245
  Size: 48KB

💡 To import into another agent:
   nmem import brain_snapshot_2026-02-26.json
   
💡 To share with teammate:
   Copy the JSON file and they run nmem import
```

## Portable Consciousness

This snapshot is the "Brain-as-a-Service" concept from NeuralMemory's vision:
- All associative reflexes are preserved in the synapse graph
- Another agent loading this snapshot gets all the relationships
- Not just facts — but the causal and temporal reasoning

## Anti-patterns
- Do NOT snapshot before deduplication (exports noise)
- Do NOT share snapshots with sensitive credentials/tokens in memories
- DO run /memory-audit before important snapshots
