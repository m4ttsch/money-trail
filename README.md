# The Money Trail

An interactive walkthrough of [r/personalfinance's income flowchart](https://www.reddit.com/r/personalfinance/) — the well-known "where should my next dollar go" decision tree, originally created by u/atlasvoid (2016) based on a flowchart by u/beakyhed89.

Two ways to use it:

- **Step through** — answer one waypoint at a time (budget → emergency fund → employer match → debt payoff → retirement → other goals), with back/restart controls and a phase progress rail.
- **Overview map** — the whole decision tree as a pannable, zoomable diagram. Drag to pan, scroll to zoom, click any waypoint to jump straight into it. Your visited path highlights in brass.

## Development

```sh
pnpm install
pnpm dev        # start the dev server
pnpm test       # run the data-integrity tests
pnpm lint       # oxlint
pnpm build      # typecheck + production build to dist/
```

The flowchart's nodes, branches, and copy live in `src/data/flowchart.ts`. `src/data/flowchart.test.ts` checks the graph for dangling references, unreachable nodes, and correct overview-map edge direction.

## Deployment

Pushes to `main` build and deploy to GitHub Pages via `.github/workflows/deploy.yml`. In the repo's Settings → Pages, set the source to **GitHub Actions** once.
