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
export type PlanConsentConsentType = typeof PlanConsentConsentType[keyof typeof PlanConsentConsentType];
export const PlanConsentConsentType = {
    plan_agreement: 'plan_agreement',
} as const;
export type PlanConsentChannel = typeof PlanConsentChannel[keyof typeof PlanConsentChannel];
export const PlanConsentChannel = {
    employee_mobile: 'employee_mobile',
} as const;
export interface PlanConsent {
    consentType: PlanConsentConsentType;
    consentVersion: string;
    channel: PlanConsentChannel;
    acceptedAt: string;
    capturedByRole: string;
}
export type PlanDetailConsentConsentType = typeof PlanDetailConsentConsentType[keyof typeof PlanDetailConsentConsentType];
export const PlanDetailConsentConsentType = {
    plan_agreement: 'plan_agreement',
} as const;
export type PlanDetailConsentChannel = typeof PlanDetailConsentChannel[keyof typeof PlanDetailConsentChannel];
export const PlanDetailConsentChannel = {
    employee_mobile: 'employee_mobile',
} as const;
export type PlanDetailConsent = {
    consentType: PlanDetailConsentConsentType;
    consentVersion: string;
    channel: PlanDetailConsentChannel;
    acceptedAt: string;
    capturedByRole: string;
} | null;
export type PlanDetail = PlanListItem & ({
    completedAt: string | null;
    cancelledAt: string | null;
    installments: Installment[];
    consent: PlanDetailConsent;
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
export type PreviewPlanScheduleBody = {
    originalAmountPaise: string;
    numberOfCollections: number;
    frequency: PlanFrequency;
    startDate: string;
};
export type PreviewPlanSchedule200DataInstallmentsItem = {
    installmentNumber: number;
    dueDate: string;
    amountPaise: MoneyPaise;
};
export type PreviewPlanSchedule200Data = {
    totalPaise: MoneyPaise;
    installments: PreviewPlanSchedule200DataInstallmentsItem[];
};
export type PreviewPlanSchedule200 = {
    data: PreviewPlanSchedule200Data;
};
export type GetPlan200 = {
    data: PlanDetail;
};
export type RecordPlanConsent201 = {
    data: PlanConsent;
};
