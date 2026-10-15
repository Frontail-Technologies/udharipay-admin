# UdhariPay Admin Screen Registry

Statuses:
- `DONE` — implemented, real API data, no known gaps
- `REVIEW` — implemented, awaiting visual review
- `TODO` — planned but not built
- `GAP` — intentionally absent due to missing backend contract (documented)

## Auth

| Route | Screen | Status |
|---|---|---|
| `/login` | Admin Login | DONE |
| `(admin)` layout | AdminAuthGuard + AdminShell | DONE |

Master Data includes Geography tabs for Countries, States, and Cities. State and City forms use parent IDs and active/inactive status controls.

## Overview

| Route | Screen | Status |
|---|---|---|
| `/dashboard` | Dashboard — metrics (collections report, merchants report, customers report, mandates report), Needs Attention (overdue queue, pending KYC, pending billing), Recent Activity (audit events) | DONE |

## Operations

| Route | Screen | Status |
|---|---|---|
| `/merchants` | Merchant List — server-side search + status + business-category filters, cursor pagination, create | DONE |
| `/merchants/[merchantId]` | Merchant Detail — Overview (business profile, contact, accounts, assignment), KYC section, billing section | DONE |
| `/customers` | Customer List — server-side search + merchant filter + status filter, cursor pagination, create | DONE |
| `/customers/[customerId]` | Customer Detail — profile, plans, mandates, payment history, KYC section, communications section | DONE |
| `/plans` | Udhaar Plan List — server-side search + customer/merchant filter + status filter, cursor pagination, create | DONE |
| `/plans/[planId]` | Plan Detail — purchase details, schedule/installments, payment history, mandate section | DONE |
| `/payments/[paymentId]` | Payment Detail — amount, method, source, status, provider reference, allocations (reached from Plan detail, no standalone list) | DONE |
| `/collections` | Collections — collection queue with due/overdue/timing state, follow-up history, add follow-up | DONE |
| `/mandates` | Mandate List — server-side search + customer/merchant/method/status filter, cursor pagination | DONE |
| `/mandates/[mandateId]` | Mandate Detail — method, status, provider reference, attempt history | DONE |
| `/payments` | Global Payment List — type + status filters, cursor pagination, row routing to detail or subscription | DONE |

## Access

| Route | Screen | Status |
|---|---|---|
| `/employees` | Employee List — server-side search + status filter, cursor pagination, create | DONE |
| `/employees/[employeeId]` | Employee Detail — profile, contact, assigned merchants, KYC section | DONE |

## Review

| Route | Screen | Status |
|---|---|---|
| `/kyc` | KYC & Verification Queue — server-side search + subject-type + status + date-range filters, cursor pagination | DONE |
| `/kyc/[reviewId]` | KYC Review Detail — subject identity, documents (view private S3 links), submit, approve, reject, request resubmission | DONE |

## Billing

| Route | Screen | Status |
|---|---|---|
| `/subscriptions` | Subscription Invoice List — server-side status + type + merchant filters, cursor pagination | DONE |
| `/subscriptions/[invoiceId]` | Invoice Detail — type (activation fee vs subscription), amount, status, due date, merchant | DONE |

## Reports

| Route | Screen | Status |
|---|---|---|
| `/reports` | Reports — tabbed by kind (collections, merchants, customers, mandates, plans, KYC, billing); date-range, merchant, employee, status, method, invoice-type filters; server-side cursor pagination; binary export | DONE |

## System

| Route | Screen | Status |
|---|---|---|
| `/communications` | Communications — WhatsApp Templates (list, create version, update, activate, delete, preview) + Announcements (list, create with recipient search and preview) | DONE |
| `/events` | Events / Audit Log — server-side actor + action + entity + date-range filters, cursor pagination, detail sheet | DONE |
| `/settings` | Settings — billing configuration (activation fee, subscription plans, grace period), system info | DONE (local; no backend settings API yet) |

## Configuration

| Route | Screen | Status |
|---|---|---|
| `/master-data` | Master Data — tabbed management of Business Categories, Bank Account Types, Customer ID Types, Mandate Methods, Countries; inline name/sortOrder/active editing; code is read-only | DONE |

## Notes

- All implemented screens use real TanStack Query hooks against the generated API client. No demo data, mock stores, or legacy fixtures exist in any production code path (enforced by `structuralFixtureAudit.test.ts`).
- Admin `SessionContext` exposes only `SafeUser` (id, role, status) — no name field. The "Good morning, Admin" greeting is intentional.
- The global search bar in AdminTopbar is a visual placeholder with no current wiring; no global search backend endpoint exists yet.
