import type { CursorPagination, MoneyPaise } from "../common";
export type PlanFrequency = typeof PlanFrequency[keyof typeof PlanFrequency];
export const PlanFrequency = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
} as const;
export type PlanStatus = typeof PlanStatus[keyof typeof PlanStatus];
export const PlanStatus = {
    active: 'active',
    completed: 'completed',
    paused: 'paused',
    cancelled: 'cancelled',
} as const;
export type InstallmentDisplayState = typeof InstallmentDisplayState[keyof typeof InstallmentDisplayState];
export const InstallmentDisplayState = {
    paid: 'paid',
    partially_paid: 'partially_paid',
    scheduled: 'scheduled',
} as const;
export interface Installment {
    id: string;
    installmentNumber: number;
    dueDate: string;
    amountPaise: MoneyPaise;
    paidAmountPaise: MoneyPaise;
    outstandingAmountPaise: MoneyPaise;
    displayState: InstallmentDisplayState;
}
export interface PlanListItem {
    id: string;
    publicId: string;
    merchantId: string;
    customerId: string;
    description: string;
    invoiceNumber: string | null;
    originalAmountPaise: MoneyPaise;
    numberOfCollections: number;
    frequency: PlanFrequency;
    startDate: string;
    status: PlanStatus;
    createdAt: string;
    updatedAt: string;
}
export type PlanDetail = PlanListItem & ({
    completedAt: string | null;
    cancelledAt: string | null;
    installments: Installment[];
});
export type CreatePlanBody = {
    description: string;
    invoiceNumber?: string | null;
    originalAmountPaise: string;
    numberOfCollections: number;
    frequency: PlanFrequency;
    startDate: string;
};
export type CreatePlan201 = {
    data: PlanDetail;
};
export type ListPlansParams = {
    limit?: number;
    cursor?: string;
    status?: PlanStatus;
    frequency?: PlanFrequency;
};
export type ListPlans200Data = {
    items: PlanListItem[];
    pagination: CursorPagination;
};
export type ListPlans200 = {
    data: ListPlans200Data;
};
export type GetPlan200 = {
    data: PlanDetail;
};
