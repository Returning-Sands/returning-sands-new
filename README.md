# Returning Sands — new website

Blank Next.js + Tailwind starter for the replacement returningsands.org site.
Repo lives in the Returning-Sands GitHub organisation; Vercel deploys `main` automatically.

- Local preview: `npm install` then `npm run dev` → http://localhost:3000
- Publish: commit and `git push` to `main`; Vercel rebuilds automatically.
- Page content lives in `app/page.tsx`; images go in `public/`.

## Checks on pull requests

`.github/workflows/a11y.yml` ("Accessibility and size gate", job `gate`) runs on every
pull request and on pushes to `main`: `npm run build` (tsc, eslint, vitest, `next build`),
`npm run test:e2e` (Playwright axe scan of every route plus the behavioural suites) and
`npm run size` (Home route first-party JS, 200 KB gzip). On failure the Playwright report
is uploaded as a workflow artifact.

Vercel deploys a PR preview regardless of the check result; only production is gated.
For a red check to block the production deploy, enable branch protection on `main` with
"Require status checks to pass before merging" and select the `gate` job. Without that
setting a red check is advisory only.
