import type { CollectionQueueItem, FollowUp } from "@/api/generated/contracts/collections";

export const collectionItem: CollectionQueueItem = {
  installmentId: "11111111-1111-4111-8111-111111111111",
  planId: "22222222-2222-4222-8222-222222222222",
  planPublicId: "PLN-1001",
  customerId: "33333333-3333-4333-8333-333333333333",
  customerPublicId: "CUS-1001",
  customerName: "Rahul Verma",
  customerPhone: "+919800000001",
  merchantId: "44444444-4444-4444-8444-444444444444",
  merchantName: "Amit Traders",
  installmentNumber: 2,
  dueDate: "2026-08-27",
  amountPaise: "1200000",
  paidAmountPaise: "400000",
  outstandingAmountPaise: "800000",
  collectionState: "partially_paid",
  timingState: "overdue",
  daysOverdue: 3,
  latestFollowUp: { id: "55555555-5555-4555-8555-555555555555", type: "will_pay", note: "Will pay tomorrow", createdAt: "2026-08-30T08:30:00.000Z" },
  promiseToPayDate: "2026-08-31T00:00:00.000Z",
  riskSignals: { atRisk: true, failedMandateAttempt: true, repeatedNoAnswer: false, overdueThresholdReached: false },
};

export const followUp: FollowUp = {
  id: "55555555-5555-4555-8555-555555555555",
  merchantId: collectionItem.merchantId,
  customerId: collectionItem.customerId,
  planId: collectionItem.planId,
  installmentId: collectionItem.installmentId,
  employeeId: null,
  type: "will_pay",
  note: "Will pay tomorrow",
  promisedDate: "2026-08-31T00:00:00.000Z", promisedAmountPaise: null,
  nextFollowUpAt: "2026-08-31T06:30:00.000Z",
  createdAt: "2026-08-30T08:30:00.000Z",
  updatedAt: "2026-08-30T08:30:00.000Z",
};
