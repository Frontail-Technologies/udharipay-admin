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

Customer, Plan, Payment, and Mandate domains follow the same ownership structure. Mandate hooks own customer-scoped lists, detail, attempt history, and cursor state. Mandate attempts remain provider execution evidence and are never treated as canonical Payments.

## Integration inventory

| Page/domain | Backend endpoint(s) | Generated operation(s) | Feature hook / mutation | Status |
| --- | --- | --- | --- | --- |
| `/dashboard` | Report endpoints + collection queue + KYC queue + billing invoices + audit events | `getReport`, `listCollectionQueue`, `listKycReviews`, `listBillingInvoices`, `listAuditEvents` | `useDashboard` (composes `useReport` + attention queries + activity query) | Integrated |
| `/employees`, detail | `/employees`, `/employees/{employeeId}` | Employee list/detail/create/update | `useEmployees`, `useEmployee`, Employee mutations | Integrated |
| `/merchants`, detail | `/merchants`, `/merchants/{merchantId}`, assignment and provisioning | Merchant list/detail/create/update/assignment/provision | `useMerchants`, `useMerchant`, Merchant mutations | Integrated |
| `/customers`, detail | Merchant-scoped customer list/create and customer detail/update | Customer list/detail/create/update | `useCustomers`, `useCustomer`, Customer mutations | Integrated |
| `/plans`, detail | Customer-scoped plan list/create and plan detail | `listPlans`, `createPlan`, `getPlan` | `usePlans`, `usePlan`, `useCreatePlan` | Integrated |
| `/payments` | Global payment list (UNION of customer_collection + activation_fee + merchant_subscription) | `listAllPayments` | `useGlobalPaymentsDirectory`, `useAllPayments` | Integrated |
| `/payments/[paymentId]` detail | Plan-scoped payment list and payment detail | `listPlanPayments`, `getPayment` | `usePayments`, `usePayment`, `usePlanPaymentHistory` | Integrated |
| `/mandates`, detail | Customer-scoped mandate list, detail, and attempts | `listCustomerMandates`, `getMandate`, `listMandateAttempts` | `useMandates`, `useMandate`, `useMandateAttempts` | Integrated |
| `/collections` | Canonical collection queue and installment follow-ups | `listCollectionQueue`, `listFollowUps`, `createFollowUp` | `useCollectionDirectory`, `useFollowUpHistory`, `useCreateFollowUp` | Integrated |
| `/kyc`, detail | KYC queue/detail, private document upload/view, submit and decision workflows | KYC list/detail/create/upload/confirm/submit/approve/reject/resubmission | `useKycDirectory`, `useSubjectKyc`, upload and decision hooks | Integrated |
| `/subscriptions`, detail | `/billing/invoices`, `/billing/invoices/{invoiceId}`, merchant subscription and invoice endpoints | `listBillingInvoices`, `getSubscriptionInvoice`, `getMerchantSubscription`, `listMerchantInvoices`, `createMerchantSubscription`, `getBillingSettings`, `listBillingPlans`, `updateBillingPlan`, `updateBillingSettings` | `useBillingDirectory`, `useMerchantSubscription`, billing mutations | Integrated |
| `/reports` | `/reports/{kind}` report data and binary export | `getReport`, `exportReport` | `useReportDirectory`, `useReport`, export hooks | Integrated |
| `/communications` | WhatsApp templates and announcement endpoints | Template and announcement CRUD, preview, recipient search, customer reminders | `useWhatsAppTemplates`, `useAnnouncements`, `useCreateAnnouncement`, template/reminder mutations | Integrated |
| `/events` | `/audit-events`, `/audit-events/{auditEventId}` | `listAuditEvents`, `getAuditEvent` | `useAuditDirectory`, `useAuditEvent` | Integrated |
| `/settings` | No matching backend settings API | None | Keep local until a real contract exists | Backend gap |
| `/master-data` | Master data CRUD: business categories, bank account types, customer ID types, mandate methods, countries | `listBusinessCategories`, `listBankAccountTypes`, `listCustomerIdTypes`, `listMandateMethods`, `listCountries`, and patch operations | `useBusinessCategories`, `useBankAccountTypes`, `useCustomerIdTypes`, `useMandateMethods`, `useCountries`, and update mutations | Integrated |
| `/login` and protected layout | Admin login, refresh, `/auth/me`, logout | Generated Auth operations | `AuthProvider`, `AdminAuthGuard` | Integrated |
| Razorpay provider routes | Not used by Admin | Order, verify, webhook | Generated Razorpay operations | Not applicable (checkout is outside Admin scope) |

## Geography Master Data

The `/master-data` feature uses the backend-managed Country -> State -> City hierarchy. States and cities are filtered by their parent selectors; city creation/update is admin-only, while normal reads return active records.

## Backend gaps

- **Settings**: no backend settings API. Admin settings remain local until a real contract exists.

## Regeneration

Run `npm run api:sync` after backend contract changes. Review generated diffs, run `npm run api:check`, and commit the backend spec before the generated Admin client.

## Troubleshooting

- A 401 retry occurs once after a single shared refresh request. Repeated 401 responses clear the session and return to login.
- Cookie auth requires matching backend `CORS_ORIGIN`, `credentials: true`, and a browser origin accepted by the backend origin guard.
- If generated files drift, run `npm run api:sync`; do not patch generated output.
- If report downloads contain JSON, inspect the normalized API error rather than saving the response as a file.
- If list navigation loses position, persist the cursor and filters in URL search parameters rather than component-only state.
