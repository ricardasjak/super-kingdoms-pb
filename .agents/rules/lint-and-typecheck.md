# Rule: Mandatory Verification of Types and Formatting

Always verify types and run `lint:fix` before completing any user request or committing code.

## Required Commands
Before finalizing changes:
1. **Lint and Format**:
   ```bash
   npm run lint:fix
   ```
   Ensures Biome formatting and rules are applied cleanly without syntax or lint errors.
2. **Type Checking**:
   ```bash
   npm run typecheck
   ```
   Ensures `tsc --build --noEmit` runs with 0 compiler errors across all project references and typings.

## Constraints
- Never commit or declare a task finished if `npm run lint` or `npm run typecheck` fails.
- Never use `any` to silence type errors when domain types (`TypedKingdom`, `GameStatusData`, etc.) should be accurately modeled.
