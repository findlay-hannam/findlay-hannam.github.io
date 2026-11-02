<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: none renamed; all five principles newly defined
- Added sections: Core Principles (I–V), Technical Constraints, Development Workflow, Governance
- Removed sections: none
- Templates: plan-template.md ✅ no change (Constitution Check reads this file at plan time)
             spec-template.md ✅ no change; tasks-template.md ✅ no change
- Deferred TODOs: none
-->
# Findlay Hannam Site Constitution

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
- `npm run build` (includes `tsc -b`) and `npm run lint` MUST pass before merge.
- Plain function components and hooks; no state library until local state demonstrably fails.

### III. Unit-Tested Logic
Logic MUST have unit test coverage; tests ship in the same change as the code.
- Non-trivial logic (branching, parsing, state transitions) MUST have tests.
- Pure logic SHOULD be extracted from components so it is testable without rendering.
- Bug fixes MUST start with a failing regression test.
- Coverage MUST NOT drop below 80% lines on `src/` logic; purely presentational markup is exempt.
- Tests MUST run in under 30 seconds locally and never touch the network.

### IV. Speedy Deploys
Merge to `main` MUST deploy automatically with no manual steps.
- CI runs install, lint, test, build, deploy; total budget under 3 minutes.
- Dependencies MUST be cached in CI (`setup-node` npm cache).
- Deploys are static artefacts only; rollback is `git revert` and push.

### V. Zero Runtime Cost
The running app MUST cost nothing to operate.
- Static hosting only (GitHub Pages). No servers, databases, serverless functions, or paid APIs.
- No services needing a credit card or usage-based billing.
- Persistence, if needed, uses browser storage (`localStorage`/IndexedDB), wrapped in try/catch.
- Third-party runtime calls MUST be free, keyless, and optional to core function.

## Technical Constraints

- Stack: Vite, React 19, TypeScript, oxlint; unit tests via Vitest (to be added with first
  testable logic).
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

**Version**: 1.0.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
