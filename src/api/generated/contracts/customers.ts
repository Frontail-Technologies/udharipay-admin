import type { CursorPagination, IdentityDocumentType, IdentityProfile, MandateStatus, MoneyPaise } from "../common";
export type CustomerStatus = typeof CustomerStatus[keyof typeof CustomerStatus];
export const CustomerStatus = {
    active: 'active',
    inactive: 'inactive',
    blocked: 'blocked',
} as const;
export interface Customer {
    id: string;
    publicId: string;
    merchantId: string;
    name: string;
    phone: string;
    alternatePhone: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes: string | null;
    status: CustomerStatus;
    createdAt: string;
    updatedAt: string;
}
export type CustomerListItemNextDue = {
    dueDate: string;
    amountPaise: MoneyPaise;
} | null;
export type CustomerListItem = Customer & ({
    outstandingPaise: MoneyPaise;
    overduePaise: MoneyPaise;
    nextDue: CustomerListItemNextDue;
    mandateStatus: MandateStatus | null;
});
export type CustomerActivationStatus = typeof CustomerActivationStatus[keyof typeof CustomerActivationStatus];
export const CustomerActivationStatus = {
    pending: 'pending',
    paid: 'paid',
    void: 'void',
} as const;
export interface CustomerActivation {
    id: string;
    publicId: string;
    customerId: string;
    amountPaise: MoneyPaise;
    status: CustomerActivationStatus;
    dueDate: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CustomerPlanFinancialNextDue = {
    dueDate: string;
    amountPaise: MoneyPaise;
} | null;
export interface CustomerPlanFinancial {
    planId: string;
    collectedPaise: MoneyPaise;
    outstandingPaise: MoneyPaise;
    overduePaise: MoneyPaise;
    nextDue: CustomerPlanFinancialNextDue;
}
export type CustomerFinancialSummaryNextDue = {
    dueDate: string;
    amountPaise: MoneyPaise;
} | null;
export interface CustomerFinancialSummary {
    customerId: string;
    activePlanCount: number;
    activePlansOriginalAmountPaise: MoneyPaise;
    collectedPaise: MoneyPaise;
    outstandingPaise: MoneyPaise;
    overduePaise: MoneyPaise;
    nextDue: CustomerFinancialSummaryNextDue;
    plans: CustomerPlanFinancial[];
}
export type CustomerReminderChannel = typeof CustomerReminderChannel[keyof typeof CustomerReminderChannel];
export const CustomerReminderChannel = {
    whatsapp: 'whatsapp',
} as const;
export interface CustomerReminder {
    publicId: string;
    channel: CustomerReminderChannel;
    type: string;
    status: string;
    templateKey: string;
    templateVersion: number | null;
    scheduledFor: string;
    sentAt: string | null;
    deliveredAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    failureCode: string | null;
    failureReason: string | null;
    attemptCount: number;
    installmentId: string | null;
    installmentNumber: number | null;
    dueDate: string | null;
    createdAt: string;
}
export type CustomerListView = typeof CustomerListView[keyof typeof CustomerListView];
export const CustomerListView = {
    due: 'due',
    overdue: 'overdue',
    mandate_pending: 'mandate_pending',
} as const;
export type CreateCustomerBody = {
    name: string;
    phone: string;
    alternatePhone?: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes?: string | null;
    status?: CustomerStatus;
};
export type CreateCustomer201 = {
    data: Customer;
};
export type ListCustomersParams = {
    limit?: number;
    cursor?: string;
    status?: CustomerStatus;
    view?: CustomerListView;
    search?: string;
};
export type ListCustomers200Data = {
    items: CustomerListItem[];
    pagination: CursorPagination;
};
export type ListCustomers200 = {
    data: ListCustomers200Data;
};
export type GetCustomer200 = {
    data: Customer;
};
export type UpdateCustomerBody = {
    name?: string;
    phone?: string;
    alternatePhone?: string | null;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    notes?: string | null;
    status?: CustomerStatus;
};
export type UpdateCustomer200 = {
    data: Customer;
};
export type GetCustomerFinancialSummary200 = {
    data: CustomerFinancialSummary;
};
export type ListCustomerActivityParams = {
    limit?: number;
    before?: string;
};
export type ListCustomerActivity200DataItemsItemType = typeof ListCustomerActivity200DataItemsItemType[keyof typeof ListCustomerActivity200DataItemsItemType];
export const ListCustomerActivity200DataItemsItemType = {
    payment: 'payment',
    follow_up: 'follow_up',
} as const;
export type ListCustomerActivity200DataItemsItem = {
    type: ListCustomerActivity200DataItemsItemType;
    entityId: string;
    occurredAt: string;
    amountPaise: MoneyPaise | null;
    status: string;
    note: string | null;
    planId: string;
};
export type ListCustomerActivity200DataPagination = {
    nextBefore: string | null;
};
export type ListCustomerActivity200Data = {
    items: ListCustomerActivity200DataItemsItem[];
    pagination: ListCustomerActivity200DataPagination;
};
export type ListCustomerActivity200 = {
    data: ListCustomerActivity200Data;
};
export type GetCustomerIdentity200 = {
    data: IdentityProfile;
};
export type SetCustomerIdentityBody = {
    pan?: string;
    idType?: IdentityDocumentType;
    idReference?: string;
};
export type SetCustomerIdentity200 = {
    data: IdentityProfile;
};
export type GetCustomerActivation200 = {
    data: CustomerActivation;
};
export type ListCustomerRemindersParams = {
    limit?: number;
    cursor?: string;
};
export type ListCustomerReminders200Data = {
    items: CustomerReminder[];
    pagination: CursorPagination;
};
export type ListCustomerReminders200 = {
    data: ListCustomerReminders200Data;
};
export type CancelCustomerReminder200Data = {
    cancelled: boolean;
};
export type CancelCustomerReminder200 = {
    data: CancelCustomerReminder200Data;
};
