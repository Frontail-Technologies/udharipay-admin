import type { CursorPagination, MoneyPaise } from "../common";
export type FollowUpType = typeof FollowUpType[keyof typeof FollowUpType];
export const FollowUpType = {
    customer_contacted: 'customer_contacted',
    will_pay: 'will_pay',
    requested_visit: 'requested_visit',
    dispute: 'dispute',
    no_answer: 'no_answer',
} as const;
export type CollectionState = typeof CollectionState[keyof typeof CollectionState];
export const CollectionState = {
    upcoming: 'upcoming',
    due: 'due',
    overdue: 'overdue',
    partially_paid: 'partially_paid',
    paid: 'paid',
} as const;
export type CollectionTimingState = typeof CollectionTimingState[keyof typeof CollectionTimingState];
export const CollectionTimingState = {
    upcoming: 'upcoming',
    due: 'due',
    overdue: 'overdue',
    paid: 'paid',
} as const;
export interface FollowUp {
    id: string;
    merchantId: string;
    customerId: string;
    planId: string;
    installmentId: string | null;
    employeeId: string | null;
    type: FollowUpType;
    note: string | null;
    promisedDate: string | null;
    promisedAmountPaise: MoneyPaise | null;
    nextFollowUpAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CollectionQueueItemLatestFollowUp = {
    id: string;
    type: FollowUpType;
    note: string | null;
    createdAt: string;
} | null;
export type CollectionQueueItemRiskSignals = {
    atRisk: boolean;
    failedMandateAttempt: boolean;
    repeatedNoAnswer: boolean;
    overdueThresholdReached: boolean;
};
export interface CollectionQueueItem {
    installmentId: string;
    planId: string;
    planPublicId: string;
    customerId: string;
    customerPublicId: string;
    customerName: string;
    customerPhone: string;
    merchantId: string;
    merchantName: string;
    installmentNumber: number;
    dueDate: string;
    amountPaise: MoneyPaise;
    paidAmountPaise: MoneyPaise;
    outstandingAmountPaise: MoneyPaise;
    collectionState: CollectionState;
    timingState: CollectionTimingState;
    daysOverdue: number;
    latestFollowUp: CollectionQueueItemLatestFollowUp;
    promiseToPayDate: string | null;
    riskSignals: CollectionQueueItemRiskSignals;
}
export type ListCollectionQueueParams = {
    limit?: number;
    cursor?: string;
    referenceDate?: string;
    state?: CollectionState;
    timingState?: CollectionTimingState;
    merchantId?: string;
    assignedEmployeeId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
};
export type ListCollectionQueue200Data = {
    items: CollectionQueueItem[];
    pagination: CursorPagination;
};
export type ListCollectionQueue200 = {
    data: ListCollectionQueue200Data;
};
export type CreateFollowUpBody = {
    type: FollowUpType;
    note?: string | null;
    promisedDate?: string | null;
    promisedAmountPaise?: string | null;
    nextFollowUpAt?: string | null;
};
export type CreateFollowUp201 = {
    data: FollowUp;
};
export type ListFollowUpsParams = {
    limit?: number;
    cursor?: string;
};
export type ListFollowUps200Data = {
    items: FollowUp[];
    pagination: CursorPagination;
};
export type ListFollowUps200 = {
    data: ListFollowUps200Data;
};
