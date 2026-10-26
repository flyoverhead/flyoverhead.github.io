# flyoverhead.github.io

Personal site of Aleksandr Letunov, DevSecOps and platform engineering tech lead:
<https://flyoverhead.github.io>.

Static [Astro](https://astro.build) single-page business card. Content lives in data files; the
details live on LinkedIn and GitHub.

## Local development

```sh
npm ci
npx playwright install chromium
npm run dev        # http://localhost:4321
npm run build      # build dist/ and render dist/og.png
npm test           # unit tests, incl. the NDA scan of the sources
npm run test:e2e   # Playwright against dist/ (desktop and mobile)
npm run validate   # html-validate on dist/
```

## Editing content

| What | Where |
| --- | --- |
| Name, title, pitch, links | `src/data/profile.yaml` |
| Impact numbers | `src/data/metrics.yaml` |
| Selected work | `src/data/work.yaml` |
| Stack | `src/data/stack.yaml` |
| AI and open-source copy | `src/components/AiSection.astro`, `src/components/OpenSource.astro` |

## NDA guard

The site describes work under NDA. The tests scan the sources and the built site for phone
numbers and for terms from a denylist. The denylist itself names internal systems, so it is kept
**outside the repository**:

- locally: `~/.config/flyoverhead-site/nda-denylist.txt`, one literal term per line, `#` for
  comments (override the path with `NDA_DENYLIST_FILE`);
- in CI: the repository secret `NDA_DENYLIST`, with the same content.

A missing or empty denylist fails the tests, and hits report `denylist#N`, never the term.

## Deployment

`.github/workflows/deploy.yml` builds and tests every push and pull request. It deploys `main` to
GitHub Pages.
