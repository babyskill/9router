---
description: Import project knowledge into NeuralMemory (decisions, errors, patterns)
---

# /nm-import — Project Knowledge Import

## When to use
- Bắt đầu NeuralMemory trên project đã có sẵn
- Khi bắt đầu cấu hình NeuralMemory lần đầu
- Muốn bulk-import từ brain/ Markdown files (legacy)

## What to import

```
Priority 1 — Decisions (brain/decisions/*.md)
Priority 2 — Solutions (brain/solutions/*.md)  
Priority 3 — CODEBASE.md (architecture patterns)
Priority 4 — .project-identity (project context)
Priority 5 — git log (recent changes pattern)
```

## Steps

### Step 1: Scan sources
```
Sources found:
  brain/decisions/ — 12 files
  brain/solutions/ — 8 files
  CODEBASE.md — 1 file
  .project-identity — 1 file

Total import estimate: ~45 memories
Proceed? [yes/no]
```

### Step 2: Parse each source
For each file:
- Extract individual information units
- Classify by type (decision, error, fact, instruction)
- Extract tags from content
- Set priority based on type

### Step 3: Deduplication
```python
# Check NeuralMemory for existing similar memories
nmem_recall(content_keywords)
# → Skip if identical
# → Flag if conflicting
```

### Step 4: Batch import preview
Show 10 at a time, confirm each batch

### Step 5: Build synapse graph
After import, run:
```python
nmem_auto()  # Auto-detect relationships between imported memories
```

### Step 6: Import summary
```
✅ Import Complete
   Imported: 42 memories
   Skipped: 3 duplicates
   Auto-linked: 18 synapse connections

Brain is now seeded. Run /memory-audit to check quality.
```

## Anti-patterns
- Do NOT import everything blindly — quality over quantity
- Do NOT import temporary notes or debug snippets
- Do NOT skip the deduplication step (creates noise)
