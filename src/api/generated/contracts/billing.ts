import type { CursorPagination, MoneyPaise } from "../common";
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
export type SubscriptionInvoiceStatus = typeof SubscriptionInvoiceStatus[keyof typeof SubscriptionInvoiceStatus];
export const SubscriptionInvoiceStatus = {
    pending: 'pending',
    paid: 'paid',
    failed: 'failed',
    void: 'void',
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
export type MerchantSubscriptionActivationInvoice = SubscriptionInvoice & ({
    [key: string]: unknown;
} | null);
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
    activationInvoice: MerchantSubscriptionActivationInvoice;
    createdAt: string;
    updatedAt: string;
}
export type CreateMerchantSubscriptionBodyPlanCode = typeof CreateMerchantSubscriptionBodyPlanCode[keyof typeof CreateMerchantSubscriptionBodyPlanCode];
export const CreateMerchantSubscriptionBodyPlanCode = {
    standard: 'standard',
    premium: 'premium',
    enterprise: 'enterprise',
} as const;
export type CreateMerchantSubscriptionBody = {
    planCode: CreateMerchantSubscriptionBodyPlanCode;
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
