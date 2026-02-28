---
title: Contributing Guide
description: How to contribute to Storno — project setup, coding standards, and guidelines.
---

# Contributing Guide

Welcome to the Storno contributing guide. This section covers everything you need to get started contributing to the project, from environment setup to submitting pull requests.

## Project Overview

Storno is a full-stack e-invoicing platform split across multiple repositories:

- **[stornoro/storno](https://github.com/stornoro/storno)** — Monorepo containing backend (Symfony 7.4 API), frontend (Nuxt), and deploy configs
- **[stornoro/storno-mobile-app](https://github.com/stornoro/storno-mobile-app)** — React Native / Expo mobile app
- **[stornoro/storno-cli](https://github.com/stornoro/storno-cli)** — MCP-compatible CLI tool
- **[stornoro/docs](https://github.com/stornoro/docs)** — API documentation (Next.js + Markdoc)
- **[stornoro/status](https://github.com/stornoro/status)** — Uptime monitoring (Upptime)

## Getting Started

Choose the platform you want to contribute to:

- [Mobile App Setup](/contributing-guide/mobile-app/setup-guide) — Set up the React Native development environment
- [Mobile App Architecture](/contributing-guide/mobile-app/architecture) — Understand the mobile app's architecture and patterns
- [Mobile App Common Errors](/contributing-guide/mobile-app/common-errors) — Troubleshooting common development issues
- [Translation Guidelines](/contributing-guide/mobile-app/translation-guidelines) — Adding or updating translations

## Branching & Commits

The project uses `main` as the primary branch. When working on changes:

- **Features:** `feature/<description>`
- **Fixes:** `fix/<description>`
- **Chores:** `chore/<description>`

Write concise commit messages that focus on _why_ the change was made, not just _what_ changed.

## Full-Stack Parity

When making changes that affect plans, features, types, or i18n labels, **always update all platforms** across their respective repositories:

1. **Backend** — `stornoro/storno` → `backend/src/`
2. **Frontend** — `stornoro/storno` → `frontend/app/` + `frontend/i18n/`
3. **Mobile** — `stornoro/storno-mobile-app` → `src/` + `app/`
4. **Docs** — `stornoro/docs` → `content/`

When adding new API endpoints to the backend, also add corresponding MCP tools to `stornoro/storno-cli` → `src/tools/`.

## Coding Standards

- TypeScript strict mode is enabled across all platforms
- Use ESLint for linting (`npm run lint`)
- Follow existing patterns in the codebase — consistency is more important than personal preference
- Keep PRs focused and small when possible
- Include meaningful PR descriptions that explain the _why_

## Quick Links

- [API Documentation](/getting-started/quickstart) — API reference and conventions
- [Authentication](/getting-started/authentication) — Auth flow details
- [Self-Hosting](/getting-started/self-hosting) — Running the platform locally
