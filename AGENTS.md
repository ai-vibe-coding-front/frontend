# AGENTS.md

## Project Context

This project uses AI-assisted development. Follow the team rules in `docs/ai-rules.md`.

## Main Rule

Help the developer implement only the requested feature within the allowed scope. Do not make broad architectural changes unless explicitly requested.

## Protected Areas

Do not directly modify the following files or directories unless the team lead explicitly allows it.

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/auth.ts`
- `src/middleware.ts`
- `src/types/**`
- `src/lib/**`
- `src/components/common/**`
- `src/components/layout/**`
- `package.json`
- `pnpm-lock.yaml`
- `next.config.ts`
- `tailwind.config.ts`
- `.env`
- `.env.example`

If a protected file seems to require changes, stop and explain:

1. Why the change is needed
2. Which file would be affected
3. What the risk is
4. What exact change you recommend

## Coding Rules

- Keep changes small and focused.
- Do not rewrite unrelated code.
- Do not change API response shapes without approval.
- Do not add dependencies without approval.
- Do not expose secrets or environment variables.
- Keep page-specific components inside the page folder unless commonization is approved.
- Preserve existing naming conventions and folder structure.
- Add loading, empty, and error states when implementing UI connected to API data.
- Add basic validation for user input.

## Review Rules

When reviewing a pull request, check:

- Whether the change matches the related issue.
- Whether the change modifies files outside the requested scope.
- Whether protected files are changed without approval.
- Whether unnecessary formatting-only changes are included.
- Whether API response shapes or shared types changed unexpectedly.
- Whether secrets or environment variables are exposed.
- Whether the author can reasonably explain the generated code.

## Verification

After changes, run the available checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If a check fails, explain the cause and fix it when it is within the requested scope.
