# UdhariPay Admin

Next.js Admin console using the backend OpenAPI contract, Orval-generated Axios/TanStack Query clients, React Hook Form, Zod, and the existing UdhariPay component system.

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

The backend defaults to `http://localhost:4000`. Set `NEXT_PUBLIC_API_BASE_URL` when it runs elsewhere, and configure the backend `CORS_ORIGIN` for the Admin origin.

## API workflow

```bash
npm run api:sync
npm run api:check
npm run typecheck
npm run lint
npm test
npm run build
```

`api:sync` regenerates `../backend/openapi.json` and the committed client in `src/api/generated`. Never edit generated files manually.

See `docs/api-integration.md` for architecture, feature status, and troubleshooting.
