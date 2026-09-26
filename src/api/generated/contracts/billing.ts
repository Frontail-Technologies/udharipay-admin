import type { CursorPagination, MandateMethod, MoneyPaise, SubscriptionInvoiceStatus } from "../common";
export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];
export const SubscriptionStatus = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    grace: 'grace',
    restricted: 'restricted',
    cancelled: 'cancelled',
} as const;
export type SubscriptionAutopayStatus = typeof SubscriptionAutopayStatus[keyof typeof SubscriptionAutopayStatus];
export const SubscriptionAutopayStatus = {
    pending: 'pending',
    active: 'active',
    failed: 'failed',
    cancelled: 'cancelled',
} as const;
export type SubscriptionInvoiceType = typeof SubscriptionInvoiceType[keyof typeof SubscriptionInvoiceType];
export const SubscriptionInvoiceType = {
    activation_fee: 'activation_fee',
    subscription: 'subscription',
    addon: 'addon',
} as const;
export interface SubscriptionInvoice {
    id: string;
    publicId: string;
    subscriptionId: string;
    merchantId: string;
    type: SubscriptionInvoiceType;
    amountPaise: MoneyPaise;
    status: SubscriptionInvoiceStatus;
    operationalStatus: string;
    dueDate: string;
    periodStart: string | null;
    periodEnd: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type MerchantSubscriptionLatestPayment = {
    status: string;
    amountPaise: MoneyPaise;
    method: string | null;
    reference: string | null;
    attemptedAt: string;
} | null;
export interface MerchantSubscription {
    id: string;
    merchantId: string;
    planCode: string;
    planName: string;
    monthlyAmountPaise: MoneyPaise;
    status: SubscriptionStatus;
    entitlement: boolean;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    nextBillingDate: string | null;
    autoPayStatus: SubscriptionAutopayStatus;
    activationInvoice: SubscriptionInvoice | null;
    latestPayment: MerchantSubscriptionLatestPayment;
    createdAt: string;
    updatedAt: string;
}
export interface BillingSettings {
    activationFeePaise: MoneyPaise;
    customerActivationFeePaise: MoneyPaise;
    updatedAt: string;
}
export interface BillingPlan {
    code: string;
    name: string;
    monthlyAmountPaise: MoneyPaise;
    isActive: boolean;
    displayOrder: number;
    updatedAt: string;
}
export type SubscriptionAutopayStatusProperty = typeof SubscriptionAutopayStatusProperty[keyof typeof SubscriptionAutopayStatusProperty];
export const SubscriptionAutopayStatusProperty = {
    authorization_pending: 'authorization_pending',
    active: 'active',
    failed: 'failed',
    expired: 'expired',
    cancelled: 'cancelled',
} as const;
export type SubscriptionAutopayBank = {
    bankName: string;
    accountNumberMasked: string | null;
} | null;
export interface SubscriptionAutopay {
    method: MandateMethod;
    status: SubscriptionAutopayStatusProperty;
    monthlyChargePaise: MoneyPaise;
    debitDay: number;
    bank: SubscriptionAutopayBank;
    authorizationUrl: string | null;
    expiresAt: string;
    authorizedAt: string | null;
    failureReason: string | null;
}
export interface SubscriptionDirectoryItem {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantPublicId: string;
    planCode: string;
    planName: string;
    monthlyAmountPaise: MoneyPaise;
    status: SubscriptionStatus;
    currentPeriodEnd: string;
    nextBillingDate: string | null;
    autoPayStatus: SubscriptionAutopayStatus;
    activationInvoiceStatus: string | null;
    createdAt: string;
}
export type CreateMerchantSubscriptionBody = {
    planCode: string;
    startsOn: string;
};
export type CreateMerchantSubscription201 = {
    data: MerchantSubscription;
};
export type GetMerchantSubscription200 = {
    data: MerchantSubscription;
};
export type ListMerchantInvoicesParams = {
    limit?: number;
    cursor?: string;
};
export type ListMerchantInvoices200Data = {
    items: SubscriptionInvoice[];
    pagination: CursorPagination;
};
export type ListMerchantInvoices200 = {
    data: ListMerchantInvoices200Data;
};
export type GetSubscriptionInvoice200 = {
    data: SubscriptionInvoice;
};
export type ListBillingInvoicesParams = {
    limit?: number;
    cursor?: string;
    status?: SubscriptionInvoiceStatus;
    invoiceType?: SubscriptionInvoiceType;
    merchantId?: string;
    dueFrom?: string;
    dueTo?: string;
};
export type ListBillingInvoices200Data = {
    items: SubscriptionInvoice[];
    pagination: CursorPagination;
};
export type ListBillingInvoices200 = {
    data: ListBillingInvoices200Data;
};
export type RequestSubscriptionAutopayBodyMethod = typeof RequestSubscriptionAutopayBodyMethod[keyof typeof RequestSubscriptionAutopayBodyMethod];
export const RequestSubscriptionAutopayBodyMethod = {
    upi_autopay: 'upi_autopay',
    enach: 'enach',
} as const;
export type RequestSubscriptionAutopayBody = {
    method: RequestSubscriptionAutopayBodyMethod;
};
export type RequestSubscriptionAutopay201Data = {
    autopay: SubscriptionAutopay | null;
};
export type RequestSubscriptionAutopay201 = {
    data: RequestSubscriptionAutopay201Data;
};
export type GetSubscriptionAutopay200Data = {
    autopay: SubscriptionAutopay | null;
};
export type GetSubscriptionAutopay200 = {
    data: GetSubscriptionAutopay200Data;
};
export type GetBillingSettings200 = {
    data: BillingSettings;
};
export type UpdateBillingSettingsBody = {
    activationFeePaise?: string;
    customerActivationFeePaise?: string;
};
export type UpdateBillingSettings200 = {
    data: BillingSettings;
};
export type ListBillingPlans200Data = {
    items: BillingPlan[];
};
export type ListBillingPlans200 = {
    data: ListBillingPlans200Data;
};
export type UpdateBillingPlanBody = {
    name?: string;
    monthlyAmountPaise?: string;
    isActive?: boolean;
    displayOrder?: number;
};
export type UpdateBillingPlan200 = {
    data: BillingPlan;
};
export type ListSubscriptionDirectoryParams = {
    limit?: number;
    cursor?: string;
    status?: ListSubscriptionDirectoryStatus;
    planCode?: string;
    autoPayStatus?: ListSubscriptionDirectoryAutoPayStatus;
    search?: string;
};
export type ListSubscriptionDirectoryStatus = typeof ListSubscriptionDirectoryStatus[keyof typeof ListSubscriptionDirectoryStatus];
export const ListSubscriptionDirectoryStatus = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    grace: 'grace',
    restricted: 'restricted',
    cancelled: 'cancelled',
} as const;
export type ListSubscriptionDirectoryAutoPayStatus = typeof ListSubscriptionDirectoryAutoPayStatus[keyof typeof ListSubscriptionDirectoryAutoPayStatus];
export const ListSubscriptionDirectoryAutoPayStatus = {
    pending: 'pending',
    active: 'active',
    failed: 'failed',
    cancelled: 'cancelled',
} as const;
export type ListSubscriptionDirectory200Data = {
    items: SubscriptionDirectoryItem[];
    pagination: CursorPagination;
};
export type ListSubscriptionDirectory200 = {
    data: ListSubscriptionDirectory200Data;
};
export type GetSubscriptionSummary200Data = {
    activeSubscriptions: number;
    mrrPaise: MoneyPaise;
    pastDueSubscriptions: number;
    cancelledThisMonth: number;
    autopayActiveSubscriptions: number;
    activationFeesPendingCount: number;
    activationFeesPendingPaise: MoneyPaise;
};
export type GetSubscriptionSummary200 = {
    data: GetSubscriptionSummary200Data;
};
