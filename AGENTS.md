# Agent Guide

Purpose
- Guide agentic coding tools in this repo.
- Prefer pointing to in-repo sources of truth.
- Keep this file stable and high level.

Repo layout
- `apps/frontend-practice`: Interview-style React exercises and tests.
- `apps/storybook`: Storybook for UI demos.
- `apps/web`: TanStack Start app (Vite + Nitro).
- `packages/ui`: UI components and OS windowing primitives.
- `specs`: Product specs and roadmap.
- `tooling/tsconfig`: Shared TS configs.

Command sources
- Root scripts: `package.json`.
- Package scripts: `apps/web/package.json`, `apps/storybook/package.json`, `packages/ui/package.json`.
- CI setup steps: `tooling/github/setup/action.yml`.
- Workspace layout: `pnpm-workspace.yaml`.
- Package manager behavior: `.npmrc`.

Build/lint/test guidance
- Use the scripts defined in the package.json files listed above.
- When running a single test, follow the package test script and pass file path or `-t` as supported by Vitest.
- Prefer Storybook stories with `play` for visual interactions; use Vitest for
  nonvisual logic, hooks, and routing contracts.

Code style sources
- Formatting and lint rules: `biome.json` and package-level `biome.json` files.
- TypeScript settings: `tooling/tsconfig` and package `tsconfig.json` files.
- Spellcheck config: `cspell.config.yaml`.

Imports and modules
- Import ordering, unused imports, and formatting are enforced by Biome.
- Prefer relative imports within a package; use `@acme/*` for shared packages.
- Use `import type` for type-only imports where appropriate.

Types and naming
- Prefer explicit types for exported APIs when non-obvious.
- Avoid `any` unless unavoidable and justified.
- Follow existing naming conventions in the package you touch.

React and UI conventions
- Follow existing component patterns in `apps/web` and `packages/ui`.
- Keep JSX readable; extract helpers when logic grows.

Styling
- Tailwind utilities are the primary styling mechanism.
- Follow existing class composition patterns (see `packages/ui/src/components`).

State and data
- Window/OS state patterns live in `packages/ui/src/os`.
- Keep state updates immutable.

Error handling
- Prefer early returns and explicit null checks.
- Avoid swallowing errors; log or return safe values.

Specs
- `specs/roadmap.md` tracks upcoming work; active specs describe unfinished
  features. Remove specs when their features are complete.
- Update the relevant spec or roadmap when product behavior changes.

Notes
- Keep deployment notes high-level and refer to `apphosting.yaml` for config.
