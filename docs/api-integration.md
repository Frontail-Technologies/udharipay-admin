# API Integration

## Flow

Backend Zod contracts generate `../backend/openapi.json`. Orval reads that document and writes endpoint functions, TanStack Query hooks, and models under `src/api/generated`.

Application code must not import Axios directly. Generated operations use `src/api/http/client.ts`, which owns the base URL, cookie credentials, request IDs, timeout, error normalization, and single-flight session refresh. Feature code consumes generated hooks through `src/features` when mapping or cross-operation behavior is required.

## Shared infrastructure

- `QueryProvider` owns query retry, freshness, garbage collection, and refetch defaults.
- `AuthProvider` derives the Admin session from `GET /api/v1/auth/me` and clears all cached server data on logout or terminal refresh failure.
- `AdminAuthGuard` protects all routes under the Admin layout.
- `ConfirmProvider` is the single confirmation path for consequential actions.
- `applyApiFormErrors` maps backend Zod field errors to React Hook Form.
- Money helpers retain paise as decimal strings or bigint and do not use floating-point storage.
- Report exports are generated as `Blob` requests and should use the shared download helpers.
- Cursor/filter state uses URL search parameters through `src/lib/urlState.ts`.

## Integration inventory

| Domain | Generated contract/client | Admin UI integration |
| --- | --- | --- |
| Auth | Complete | Login, `/auth/me`, refresh, logout, route protection complete |
| Employees | Complete | Existing screens remain demo-backed |
| Merchants | Complete | List is live with an explicit demo fallback; assignment removal is a live mutation |
| Customers | Complete | Existing screens remain demo-backed |
| Plans | Complete | Existing screens remain demo-backed |
| Payments | Complete | Existing screens remain demo-backed |
| Razorpay | Complete | No Admin action is currently required |
| Mandates | Complete | Existing monitoring screens remain demo-backed |
| Collections | Complete | Existing screens remain demo-backed |
| KYC | Complete | Existing review workflow remains demo-backed |
| Billing | Complete | Existing screens remain demo-backed |
| Reports | Complete, including binary exports | Existing report presentation remains demo-backed |
| Audit | Complete | Existing event screens remain demo-backed |

The merchant adapter preserves the approved table hierarchy while backend aggregate fields are not yet returned by the merchant directory endpoint. Missing aggregate values remain neutral instead of being fabricated.

## Regeneration

Run `npm run api:sync` after backend contract changes. Review generated diffs, run `npm run api:check`, and commit the backend spec before the generated Admin client.

## Troubleshooting

- A 401 retry occurs once after a single shared refresh request. Repeated 401 responses clear the session and return to login.
- Cookie auth requires matching backend `CORS_ORIGIN`, `credentials: true`, and a browser origin accepted by the backend origin guard.
- If generated files drift, run `npm run api:sync`; do not patch generated output.
- If report downloads contain JSON, inspect the normalized API error rather than saving the response as a file.
- If list navigation loses position, persist the cursor and filters in URL search parameters rather than component-only state.
