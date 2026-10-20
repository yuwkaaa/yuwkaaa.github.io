# yuwkaaa.github.io

Personal site. Two halves:

- **`/projects/`** — built from the GitHub API at build time. Any repo that is not
  named `CVE-YYYY-NNNNN` lands here. Nothing to maintain by hand.
- **`/research/`** — CVE findings and CTF writeups, as Markdown in
  `src/content/research/`.

## Local

```
npm install
npm run dev      # preview on http://localhost:4321
npm run build    # writes the static site to dist/
```

The dev server is only for previewing. GitHub Pages serves the files in `dist/`;
nothing runs on a server.

## Deploy

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Set **Settings → Pages → Source** to **GitHub Actions** once.

## Adding a writeup

Drop a Markdown file in `src/content/research/`:

```markdown
---
title: "Chall name — what broke"
description: "One sentence."
pubDate: 2026-11-02
kind: ctf          # or: cve
event: "Some CTF 2026"
tags: ["pwn", "heap"]
---
```

CVE entries take `cve`, `vendor`, `severity`, `advisory` and `repo` as well.

## Pinning and hiding projects

`src/data/featured.json`:

- `pin` — repo names in the order they should appear first
- `hide` — repo names to leave out
- `describe` — override a repo's GitHub description
- `fallback` — the list used if the GitHub API is unreachable at build time
