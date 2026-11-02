# Development workflow

## Branches

Create a short-lived branch from `main` for each change:

- `feature/<short-description>` for new work.
- `fix/<short-description>` for bug fixes.
- `docs/<short-description>` for documentation-only changes.

Use lowercase words separated by hyphens. Keep each branch focused on one change.

## Pull requests and review

- Open a pull request against `main` and describe the change, its scope, and how it was checked.
- Keep changes small and reviewable; do not commit secrets, local environment files, generated output, or unrelated work.
- Request review from a teammate. Address or discuss review feedback before merging.
- Merge only after required checks pass and approvals are obtained according to the repository's configured protection rules.

These are team conventions, not automated repository protections.
