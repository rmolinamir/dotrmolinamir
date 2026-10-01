# Specs Guide

Purpose
- Explain how to work with the spec files in this repo.
- Keep specs aligned with shipped behavior.
- Use specs as the source of truth for product intent.

What lives here
- `specs/roadmap.md` lists only upcoming work.
- Active specs describe unfinished features. `specs/archive/` holds completed
  and historical specs, including the original personal website spec.

How to use specs
- Read relevant active specs and the roadmap before product or UX changes.
- Use archived specs for background, then verify shipped behavior in code.
- Treat the roadmap as the backlog and priority signal.
- Prefer updating specs in the same PR as behavior changes.

When to update specs
- New features, removals, or changes in behavior.
- Scope shifts (MVP vs later work).
- Visual direction changes or interaction changes.

Writing guidelines
- Keep it high level; avoid implementation details.
- Use clear, short sections with bullet points.
- Reference code locations only when it clarifies ownership.
- Avoid date-based or environment-specific statements.

Completion and archive
- When a feature ships, remove it from the roadmap and move its spec to
  `specs/archive/`.

Notes
- Specs are for humans first; keep them readable and concise.
