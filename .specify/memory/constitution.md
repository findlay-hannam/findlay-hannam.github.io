<!--
Sync Impact Report
- Version change: 1.1.1 → 1.2.0 (MINOR: new Purpose & Scope section)
- Modified principles: none
- Added sections: Purpose & Scope
- Removed sections: none
- Templates: plan-template.md ✅ no change (Constitution Check reads this file at plan time)
             spec-template.md ✅ no change; tasks-template.md ✅ updated (tests REQUIRED, not optional)
- Deferred TODOs: none
-->
# Findlay Hannam Site Constitution

## Purpose & Scope

A site to combine, organise, and list baby names.
- Every feature MUST serve combining names from multiple sources, organising them, or
  listing them. Anything else is out of scope.
- Out of scope unless this section is amended: user accounts, server-side storage, social
  or sharing features that need a backend.

Rationale: a stated purpose is what makes Principle I (Minimalism) checkable; plans MUST
show which of combine, organise, or list each feature serves.

## Core Principles

### I. Minimalism (NON-NEGOTIABLE)
Every feature, file, and dependency MUST justify its existence. Build the smallest thing
that works.
- Prefer platform features (HTML, CSS, browser APIs) over libraries.
- A new runtime dependency MUST be justified in the plan; prefer none.
- No speculative abstractions, config for constant values, or scaffolding "for later".
- Deleting code is preferred over adding it.

Rationale: a hobby app lives or dies by how cheap it is to understand after a six-month gap.

### II. React + TypeScript, Strictly Typed
UI is React; all source is TypeScript with `strict` enabled.
- `any` and `@ts-ignore` are forbidden without a one-line justifying comment.
- `pnpm build` (includes `tsc -b`) and `pnpm lint` MUST pass before merge.
- Plain function components and hooks; no state library until local state demonstrably fails.

### III. Test-First (TDD) (NON-NEGOTIABLE)
Logic MUST be developed test-first using red-green-refactor.
1. Red: write a unit test for the next behaviour and see it fail for the right reason.
2. Green: write the minimum code to pass.
3. Refactor: clean up with tests green.
- No production logic is written without a failing test that demands it.
- Bug fixes MUST start with a failing regression test.
- Pure logic SHOULD be extracted from components so it is testable without rendering.
- Coverage MUST NOT drop below 80% lines on `src/` logic; purely presentational markup is exempt.
- Tests MUST run in under 30 seconds locally and never touch the network.
- `pnpm test` gates both `git push` (pre-push hook) and deploy (CI).

Rationale: tests written first prove they can fail and keep the code minimal (Principle I).

### IV. Speedy Deploys
Merge to `main` MUST deploy automatically with no manual steps.
- CI runs install, lint, test, build, deploy; total budget under 3 minutes.
- Dependencies MUST be cached in CI (`setup-node` pnpm cache).
- Deploys are static artefacts only; rollback is `git revert` and push.

### V. Zero Runtime Cost
The running app MUST cost nothing to operate.
- Static hosting only (GitHub Pages). No servers, databases, serverless functions, or paid APIs.
- No services needing a credit card or usage-based billing.
- Persistence, if needed, uses browser storage (`localStorage`/IndexedDB), wrapped in try/catch.
- Third-party runtime calls MUST be free, keyless, and optional to core function.

## Technical Constraints

- Stack: Vite, React 19, TypeScript, oxlint, Vitest; package manager is pnpm (pinned via
  `packageManager` in `package.json`). npm and yarn MUST NOT be used.
- Hosting: GitHub Pages via `.github/workflows/deploy.yml`.
- Accessibility basics (semantic HTML, keyboard operable, labelled controls) are required.
- Bundle: keep initial JS lean; any single dependency adding more than 50 kB gzipped needs
  explicit justification in the plan.

## Development Workflow

- Trunk-based: short-lived branches, small changes, merge to `main` once checks pass.
- Specs live in `specs/`; plans MUST complete the Constitution Check against Principles I–V.
- Violations require an entry in the plan's Complexity Tracking table with the simpler
  alternative rejected and why.
- Commit messages are imperative and concise.

## Governance

This constitution supersedes other practices. Amendments are made by editing this file in a
commit that updates the Sync Impact Report, version, and Last Amended date.

- Versioning (semver): MAJOR = principle removed or redefined; MINOR = principle or section
  added or materially expanded; PATCH = wording or clarification.
- Compliance: every plan runs the Constitution Check; every merge self-reviews against
  Principles I–V.
- Single maintainer: amendments need no approval beyond the owner's commit.

**Version**: 1.2.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
