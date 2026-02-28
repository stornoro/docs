# Storno Docs

Documentation site for [Storno.ro](https://storno.ro) — built with Next.js and Markdoc.

**Live:** [docs.storno.ro](https://docs.storno.ro)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## LLMs.txt

The build automatically generates `llms.txt` and `llms-full.txt` in `public/` for LLM consumption.

```bash
npm run generate-llms
```

## Structure

- `content/` — Markdown documentation files
- `app/` — Next.js app router pages
- `lib/` — Content parsing and navigation
- `components/` — React components
- `markdoc/` — Markdoc schema (tags, nodes)
- `scripts/` — Build-time generators
