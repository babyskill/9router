---
name: awkit-eval
description: |
  Guides the agent on how to run evaluation, design evaluation datasets,
  score trajectories using LLM-as-a-judge, and analyze failures using the Quality Flywheel.
metadata:
  stage: core
  version: "1.0"
  requires: "templates/eval/eval-config-template.yaml"
  tags: [eval, testing, quality, verification, core]
---

# AWKit Evaluation & Quality Flywheel Skill

This skill explains how to build, run, and optimize agents using the **Quality Flywheel** evaluation loop.

## Core Commands

*   `awkit eval create-suite`: Setup evaluation templates.
*   `awkit eval run`: Run evaluation over test dataset and grade using LLM-as-a-judge.
*   `awkit trace analyze`: Study execution traces, tool call distributions, and token usage.

## The Quality Flywheel Process

1.  **Prepare Data**: Create a test dataset file `tests/eval/cases.jsonl` containing structured prompts and target outcomes.
2.  **Run Evaluation**: Run `awkit eval run`. The system will infer outputs and score them using the Judge model.
3.  **Analyze Failures**: Inspect scores and judge reasoning to identify failing constraints.
4.  **Optimize Prompt/Code**: Refine agent prompt instructions or tool signatures, and re-run.
