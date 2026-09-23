# API Integration

## Flow

Backend Zod contracts generate `../backend/openapi.json`. Orval reads that document and writes endpoint functions and models under `src/api/generated`.

Application code must not import Axios directly. Generated operations use `src/api/http/client.ts`, which owns the base URL, cookie credentials, request IDs, timeout, error normalization, and single-flight session refresh. Feature code consumes generated functions through handwritten hooks under `src/features` when query ownership or cross-operation behavior is required.

## Shared infrastructure

- `QueryProvider` owns query retry, freshness, garbage collection, and refetch defaults.
- `AuthProvider` derives the Admin session from `GET /api/v1/auth/me` and clears all cached server data on logout or terminal refresh failure.
- `AdminAuthGuard` protects all routes under the Admin layout.
- `ConfirmProvider` is the single confirmation path for consequential actions.
- `applyApiFormErrors` maps backend Zod field errors to React Hook Form.
- Money helpers retain paise as decimal strings or bigint and do not use floating-point storage.
- Report exports are generated as `Blob` requests and should use the shared download helpers.
- Cursor/filter state uses URL search parameters through `src/shared/utils/url.ts`.

## Feature ownership

Integrated domains use `src/features/<domain>/hooks` for TanStack Query state, query keys, URL-backed list state, cache invalidation, and mutation orchestration. Domain metadata and option sets live under `src/features/<domain>/utils`, while domain UI lives under `src/features/<domain>/components`. Components retain temporary form, dialog, selection, and tab state.

Integrated Customer, Plan, Payment, and Mandate domains follow the same ownership structure. Mandate hooks own customer-scoped lists, detail, attempt history, and cursor state. Mandate attempts remain provider execution evidence and are never treated as canonical Payments.

## Integration inventory

| Page/domain | Current source | Backend endpoint(s) | Generated operation(s) | Feature hook / mutation | Status |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | Demo aggregates | Existing report endpoints can supply cards; no dashboard API added | `getReport` | Future dashboard composition hook | Pending |
| `/employees`, detail | API | `/employees`, `/employees/{employeeId}` | Employee list/detail/create/update | `useEmployees`, `useEmployee`, Employee mutations | Integrated |
| `/merchants`, detail | API | `/merchants`, `/merchants/{merchantId}`, `/assignment` | Merchant list/detail/create/update/assignment operations | `useMerchants`, `useMerchant`, Merchant mutations | Integrated for Merchant-owned contracts |
| `/customers`, detail | API | Merchant-scoped customer list/create and customer detail/update | Customer list/detail/create/update operations | `useCustomers`, `useCustomer`, Customer mutations | Integrated for Customer-owned contracts |
| `/plans`, detail | API | Customer-scoped plan list/create and plan detail | `listPlans`, `createPlan`, `getPlan` | `usePlans`, `usePlan`, `useCreatePlan` | Integrated for Plan and Installment contracts |
| Payment panels, detail | API | Plan-scoped payment list and payment detail | `listPlanPayments`, `getPayment` | `usePayments`, `usePayment`, `usePlanPaymentHistory` | Integrated for Payment ledger visibility |
| `/mandates`, detail | API | Customer-scoped mandate list, detail, and attempts | `listCustomerMandates`, `getMandate`, `listMandateAttempts` | `useMandates`, `useMandate`, `useMandateAttempts` | Integrated for read-only Mandate visibility |
| `/collections` | API | Canonical collection queue and installment follow-ups | `listCollectionQueue`, `listFollowUps`, `createFollowUp` | `useCollectionDirectory`, `useFollowUpHistory`, `useCreateFollowUp` | Integrated for queue and follow-up operations |
| `/kyc`, detail | API | KYC queue/detail, private document upload/view, submit and decision workflows | KYC operations | `useKycDirectory`, `useSubjectKyc`, upload and decision hooks | Integrated for KYC review and private documents |
| `/subscriptions`, detail | Demo data | Merchant subscription and invoice endpoints | Billing operations | Subscription/invoice hooks | Pending |
| `/reports` | Demo report modules | Report data and binary export | `useGetReport`, `exportReport` | Report filters/export hook | Pending |
| `/events` | Demo audit/event stores | `/audit-events`, `/audit-events/{auditEventId}` | Audit operations | Audit list/detail hooks | Pending |
| `/settings` | Local Admin settings store | No matching backend settings API | None | Keep local until a real contract exists | Backend gap |
| `/login` and protected layout | API | Admin login, refresh, `/auth/me`, logout | Generated Auth hooks | `AuthProvider`, `AdminAuthGuard` | Integrated |
| Razorpay provider routes | Not used by Admin | Order, verify, webhook | Generated Razorpay operations | None; checkout is outside Admin scope | Documented only |

Merchant screens render only fields returned by Merchant endpoints. Customer, plan, collection, KYC, billing, and activity aggregates remain deferred to their domain integration phases because the Merchant contracts do not expose them.

Customer lists require explicit Merchant context, Plans and Mandates require explicit Customer context, and Payments require explicit Plan context. These screens do not fan out across parent resources. Mandate provider authorization and lifecycle mutations remain deferred; collection, KYC, and activity sections remain deferred.

## Regeneration

Run `npm run api:sync` after backend contract changes. Review generated diffs, run `npm run api:check`, and commit the backend spec before the generated Admin client.

## Troubleshooting

- A 401 retry occurs once after a single shared refresh request. Repeated 401 responses clear the session and return to login.
- Cookie auth requires matching backend `CORS_ORIGIN`, `credentials: true`, and a browser origin accepted by the backend origin guard.
- If generated files drift, run `npm run api:sync`; do not patch generated output.
- If report downloads contain JSON, inspect the normalized API error rather than saving the response as a file.
- If list navigation loses position, persist the cursor and filters in URL search parameters rather than component-only state.
