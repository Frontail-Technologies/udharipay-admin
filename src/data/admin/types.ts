export type MerchantStatus = "active" | "restricted" | "inactive";
export type KycStatus = "verified" | "pending" | "action_required" | "rejected";
export type SubscriptionStatus = "active" | "payment_due" | "grace" | "restricted";

export type ActivationFeeStatus = "paid" | "pending";
export type AutoPayStatus = "active" | "pending" | "not_set";

export type Merchant = {
  id: string;
  businessName: string;
  businessCategory: string;
  ownerName: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  bank: {
    accountHolderName: string;
    accountMasked: string;
    ifsc: string;
    bankName: string;
    verified: boolean;
  };
  status: MerchantStatus;
  kycStatus: KycStatus;
  kycLastReviewedAt: string;
  businessPanMasked: string;
  gstMasked: string;
  ownerIdVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: string;
  activationFeeStatus: ActivationFeeStatus;
  autoPayStatus: AutoPayStatus;
  nextDebitDate: string | null;
  assignedEmployeeName: string;
  branchCount: number;
  joinedAt: string;
};

export type CustomerAccountFlag = "restricted" | null;
export type MandateStatus = "active" | "pending" | "failed" | "not_set";

export type IdType = "Aadhaar" | "Voter ID" | "Driving License";
export type MandateMethod = "UPI Autopay" | "NACH" | "Not Set";

export type Customer = {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  alternatePhone: string | null;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  verificationStatus: KycStatus;
  panMasked: string;
  idType: IdType;
  idReferenceMasked: string;
  mandateStatus: MandateStatus;
  mandateMethod: MandateMethod;
  mandateAuthorizedAt: string | null;
  accountFlag: CustomerAccountFlag;
  joinedAt: string;
};

export type PlanFrequency = "weekly" | "monthly";

export type UdhaarPlan = {
  id: string;
  customerId: string;
  merchantId: string;
  purchaseDescription: string;
  originalAmount: number;
  installmentAmount: number;
  frequency: PlanFrequency;
  totalInstallments: number;
  startedAt: string;
};

export type PaymentStatus = "collected" | "due" | "overdue" | "failed";
export type PaymentMethod = "UPI" | "Cash" | "Mandate Debit" | "Card";

export type Payment = {
  id: string;
  planId: string;
  customerId: string;
  merchantId: string;
  installmentNumber: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  reference: string;
};

export type CollectionFollowUpType =
  | "call_attempted"
  | "customer_contacted"
  | "reminder_sent"
  | "promise_to_pay"
  | "no_response"
  | "follow_up_scheduled"
  | "note_added";

export type CollectionFollowUp = {
  id: string;
  customerId: string;
  planId: string;
  installmentId: string | null;
  employeeId: string | null;
  type: CollectionFollowUpType;
  note: string;
  promisedDate: string | null;
  nextFollowUpDate: string | null;
  createdAt: string;
};

export type MandateOperationalStatus =
  | "pending_authorization"
  | "active"
  | "paused"
  | "revoked"
  | "failed"
  | "expired";

/**
 * Audited against the current architecture (Plan Detail, Collections, and
 * the Plans table all resolve mandate state through the *customer*, never
 * a plan) — this demo's product model is customer-level mandates, one per
 * Customer+Merchant relationship. `planId` stays optional/nullable so the
 * shape can support a future plan-specific mandate without a breaking
 * change, but every seeded Mandate this phase has `planId: null`.
 */
export type Mandate = {
  id: string;
  customerId: string;
  merchantId: string;
  planId: string | null;
  provider: string;
  method: MandateMethod;
  status: MandateOperationalStatus;
  authorizedAt: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  maxAmount: number | null;
  frequency: PlanFrequency | null;
  providerReferenceMasked: string;
  createdAt: string;
  updatedAt: string;
};

export type MandateAttemptStatus = "success" | "failed" | "pending";

/**
 * A debit *attempt* against a mandate — never a Payment record. A failed
 * attempt here must never be confused with a failed Payment, a failed
 * Plan, or an automatic mandate revocation; those are separate states
 * that this demo never sets as a side effect of an attempt record.
 */
export type MandateAttempt = {
  id: string;
  mandateId: string;
  planId: string | null;
  installmentId: string | null;
  attemptedAt: string;
  amount: number | null;
  status: MandateAttemptStatus;
  failureReason: string | null;
  providerReferenceMasked: string | null;
};

export type SubscriptionOperationalStatus = "trial" | "active" | "past_due" | "paused" | "cancelled" | "expired";

/**
 * Subscription belongs to the Merchant — this is UdhariPay's own SaaS
 * revenue (activation fee + monthly plan), completely separate from
 * customer collection payments, which settle to the merchant, not
 * UdhariPay. Never mix the two datasets or their totals.
 */
export type MerchantSubscription = {
  id: string;
  merchantId: string;
  planCode: string;
  planName: string;
  status: SubscriptionOperationalStatus;
  monthlyAmount: number;
  activationFeeAmount: number;
  activationFeeStatus: ActivationFeeStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string | null;
  paymentMethod: string;
  autopayStatus: AutoPayStatus;
  cancelledAt: string | null;
  createdAt: string;
};

export type SubscriptionInvoiceType = "activation_fee" | "subscription" | "addon";
export type SubscriptionInvoiceStatus = "paid" | "pending" | "failed" | "waived";

/**
 * SaaS billing records — deliberately never built from/mixed with
 * customer Payment records. This is money owed TO UdhariPay, not money
 * owed to the merchant.
 */
export type SubscriptionInvoice = {
  id: string;
  subscriptionId: string;
  merchantId: string;
  type: SubscriptionInvoiceType;
  period: string | null;
  amount: number;
  status: SubscriptionInvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  reference: string | null;
};

export type KycEntityType = "merchant" | "customer" | "employee";
export type KycReviewStatus = "pending" | "in_review" | "approved" | "rejected" | "resubmission_required";
export type KycDocumentCheckStatus = "not_reviewed" | "accepted" | "issue_found";

export type KycDocument = {
  id: string;
  type: string;
  referenceMasked: string;
  uploadedAt: string;
  checkStatus: KycDocumentCheckStatus;
};

export type KycReviewNote = {
  id: string;
  text: string;
  at: string;
};

export type KycHistoryEventType =
  | "submitted"
  | "review_started"
  | "note_added"
  | "approved"
  | "rejected"
  | "resubmission_requested";

export type KycHistoryEvent = {
  id: string;
  type: KycHistoryEventType;
  at: string;
  note?: string;
};

export type KycReview = {
  id: string;
  entityType: KycEntityType;
  entityId: string;
  verificationType: string;
  submittedAt: string;
  assignedEmployeeName: string | null;
  status: KycReviewStatus;
  reviewerName: string | null;
  documents: KycDocument[];
  notes: KycReviewNote[];
  history: KycHistoryEvent[];
};
