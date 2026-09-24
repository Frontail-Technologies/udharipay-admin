import type { CursorPagination, MoneyPaise, PlanFrequency } from "../common";
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
export interface PlanItem {
    position: number;
    name: string;
    quantity: number;
    amountPaise: MoneyPaise;
}
export type PlanDocumentType = typeof PlanDocumentType[keyof typeof PlanDocumentType];
export const PlanDocumentType = {
    invoice: 'invoice',
    purchase_photo: 'purchase_photo',
} as const;
export interface PlanDocumentSummary {
    id: string;
    documentType: PlanDocumentType;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}
export type PlanDocumentStatus = typeof PlanDocumentStatus[keyof typeof PlanDocumentStatus];
export const PlanDocumentStatus = {
    pending: 'pending',
    uploaded: 'uploaded',
    removed: 'removed',
} as const;
export interface PlanDocument {
    id: string;
    planId: string;
    documentType: PlanDocumentType;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    status: PlanDocumentStatus;
    confirmedAt: string | null;
    createdAt: string;
}
export interface PlanPurchase {
    purchaseDate: string | null;
    totalPurchasePaise: MoneyPaise | null;
    paidAtPurchasePaise: MoneyPaise | null;
    notes: string | null;
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
    purchase: PlanPurchase;
    items: PlanItem[];
    documents: PlanDocumentSummary[];
    completedAt: string | null;
    cancelledAt: string | null;
    installments: Installment[];
    consent: PlanDetailConsent;
});
export type CreatePlanBodyItemsItem = {
    name: string;
    quantity?: number;
    amountPaise: MoneyPaise;
};
export type CreatePlanBody = {
    description: string;
    invoiceNumber?: string | null;
    originalAmountPaise: string;
    numberOfCollections?: number;
    installmentAmountPaise?: string;
    frequency: PlanFrequency;
    startDate: string;
    purchaseDate?: string;
    totalPurchasePaise?: string;
    paidAtPurchasePaise?: MoneyPaise;
    purchaseNotes?: string | null;
    items?: CreatePlanBodyItemsItem[];
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
    numberOfCollections?: number;
    installmentAmountPaise?: string;
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
export type SuggestPlansParams = {
    amountPaise: string;
};
export type SuggestPlans200DataItemsItem = {
    numberOfCollections: number;
    installmentAmountPaise: MoneyPaise;
    exact: boolean;
};
export type SuggestPlans200Data = {
    items: SuggestPlans200DataItemsItem[];
};
export type SuggestPlans200 = {
    data: SuggestPlans200Data;
};
export type CreatePlanDocumentUploadUrlBodyMimeType = typeof CreatePlanDocumentUploadUrlBodyMimeType[keyof typeof CreatePlanDocumentUploadUrlBodyMimeType];
export const CreatePlanDocumentUploadUrlBodyMimeType = {
    'application/pdf': 'application/pdf',
    'image/jpeg': 'image/jpeg',
    'image/png': 'image/png',
} as const;
export type CreatePlanDocumentUploadUrlBody = {
    documentType: PlanDocumentType;
    filename: string;
    mimeType: CreatePlanDocumentUploadUrlBodyMimeType;
    sizeBytes: number;
};
export type CreatePlanDocumentUploadUrl201DataUploadMethod = typeof CreatePlanDocumentUploadUrl201DataUploadMethod[keyof typeof CreatePlanDocumentUploadUrl201DataUploadMethod];
export const CreatePlanDocumentUploadUrl201DataUploadMethod = {
    PUT: 'PUT',
    POST: 'POST',
} as const;
export type CreatePlanDocumentUploadUrl201DataUploadHeaders = {
    [key: string]: string;
};
export type CreatePlanDocumentUploadUrl201DataUploadFields = {
    [key: string]: string;
};
export type CreatePlanDocumentUploadUrl201DataUpload = {
    url: string;
    method: CreatePlanDocumentUploadUrl201DataUploadMethod;
    headers: CreatePlanDocumentUploadUrl201DataUploadHeaders;
    fields?: CreatePlanDocumentUploadUrl201DataUploadFields;
    expiresInSeconds: number;
};
export type CreatePlanDocumentUploadUrl201Data = {
    document: PlanDocument;
    upload: CreatePlanDocumentUploadUrl201DataUpload;
};
export type CreatePlanDocumentUploadUrl201 = {
    data: CreatePlanDocumentUploadUrl201Data;
};
export type ConfirmPlanDocument200 = {
    data: PlanDocument;
};
export type RemovePlanDocument200 = {
    data: PlanDocument;
};
export type CreatePlanDocumentViewUrl200Data = {
    url: string;
    expiresInSeconds: number;
};
export type CreatePlanDocumentViewUrl200 = {
    data: CreatePlanDocumentViewUrl200Data;
};
export type GetPlan200 = {
    data: PlanDetail;
};
export type RecordPlanConsent201 = {
    data: PlanConsent;
};
