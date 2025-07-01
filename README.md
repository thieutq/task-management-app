# Task Management App

A modern web application for managing tasks efficiently. Built with Next.js, TypeScript, and Material UI, it supports features like authentication, internationalization, user management and task management.

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x

## Getting Started

First, run the development server.

```bash
cp example.env.local .env.local

npm run dev
```

## Features

- [x] Next.js
- [x] TypeScript
- [x] [i18n](https://react.i18next.com/)
- [x] [Material UI](https://mui.com/)
- [x] [React Hook Form](https://react-hook-form.com/)
- [x] React Query
- [x] Auth (Sign in, Sign up, Refresh Token)
- [x] User management (CRUD)
- [x] E2E tests ([Playwright](https://playwright.dev/))
- [x] ESLint
- [x] CI (GitHub Actions)

## Folder structure

```txt
.
├── playwright-tests <-- Here are your E2E tests
├── public
└── src
    ├── app
    │   └── [language] <-- Here are your pages (routes)
    │       ├── admin-panel
    │       ├── confirm-email
    │       ├── forgot-password
    │       ├── password-change
    │       ├── profile
    │       ├── sign-in
    │       └── sign-up
    ├── components <-- Here are your common components (Forms, Tables, etc.)
    │   ├── confirm-dialog
    │   ├── form
    │   └── table
    └── services <-- Here are your services (Auth, API calls, I18N, etc.)
        ├── api
        ├── auth
        ├── helpers
        ├── i18n
        │   └── locales
        ├── leave-page
        ├── react-query
```

## Running tests

1. Installation

   ```bash
   npx playwright install
   ```

2. Run development server

   ```bash
   npm run dev
   ```

3. Run Playwright

   ```bash
    npx playwright test --ui
   ```

   or

   ```bash
   npx playwright test
   ```
