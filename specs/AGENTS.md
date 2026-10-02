# Specs Guide

Purpose
- Explain how to use the roadmap and specs for unfinished work.
- Keep planned behavior clear without retaining completed feature documents.

What lives here
- `specs/roadmap.md` lists only upcoming work.
- Feature specs describe work that has not shipped yet.
- Shipped behavior is documented by the code and tests, not archived specs.

How to use specs
- Read relevant active specs and the roadmap before product or UX changes.
- Check the code and tests for behavior that has already shipped.
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

Completion
- When a feature ships, remove it from the roadmap and delete its spec.

Notes
- Specs are for humans first; keep them readable and concise.
