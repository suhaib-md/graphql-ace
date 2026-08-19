# GraphQL Ace

A browser-based GraphQL client for working against several APIs at once — manage environments and their auth, run queries, browse the schema, and batch operations together.

---

## Features

- **Environment manager** — save multiple GraphQL endpoints (dev, staging, prod) and switch between them
- **Authentication** — Bearer token, Basic auth, API key, or none, stored per environment
- **Query editor** — queries, mutations, and subscriptions with syntax highlighting
- **Schema explorer** — interactive tree built from an introspection query
- **Batch panel** — assemble a JSON array of operations and run them as a set
- **Request history** — recent requests with their queries, variables, and responses
- **Settings** — auto-formatting and performance-metric display

## Stack

| | |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| UI | Tailwind CSS, Radix UI primitives, shadcn/ui |
| AI | Google Genkit (`@genkit-ai/googleai`) |
| Forms | React Hook Form + Zod |

## Running locally

```bash
git clone https://github.com/suhaib-md/graphql-ace.git
cd graphql-ace
npm install
npm run dev
```

Runs at `http://localhost:3000`. Add a `GOOGLE_GENAI_API_KEY` to `.env.local` if you want the AI-assisted features.

## Project layout

```
src/
  app/
    page.tsx                the IDE
  components/
    main-panel.tsx          editor and response
    environment-manager.tsx endpoints and auth
    schema-explorer.tsx     introspection tree
    batch-panel.tsx         multi-operation runner
    history-panel.tsx       recent requests
    settings-dialog.tsx     preferences
docs/
  blueprint.md              original product and design spec
```

## Design

Deliberately plain — black on white with grey for interactive states, Poppins for UI and Source Code Pro for queries. A two-column layout: sidebar for navigation, main area for the IDE.

## Related

Part of a cluster of GraphQL tooling experiments alongside [GraphQL-Vision](https://github.com/suhaib-md/GraphQL-Vision), [graphqlapi-tester](https://github.com/suhaib-md/graphqlapi-tester), and [GraphQL-API-Checker](https://github.com/suhaib-md/GraphQL-API-Checker). This one carries the widest feature set — environments, batching, and history.
