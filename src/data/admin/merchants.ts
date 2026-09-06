import { createSeededRandom, pick, addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import type {
  Merchant,
  MerchantStatus,
  KycStatus,
  SubscriptionStatus,
  ActivationFeeStatus,
  AutoPayStatus,
} from "./types";

const BUSINESS_NAMES = [
  "Sunrise Traders",
  "Kalyan General Store",
  "Om Enterprises",
  "New Bharat Mart",
  "Shree Ganesh Kirana",
  "Laxmi Provision Store",
  "Annapurna Wholesale",
  "Krishna Departmental Store",
] as const;

const OWNER_NAMES = [
  "Ramesh Kumar",
  "Priya Sharma",
  "Vikram Singh",
  "Anita Desai",
  "Suresh Patel",
  "Meena Iyer",
  "Rajesh Gupta",
  "Kavita Nair",
] as const;

const CITY_STATE: readonly [city: string, state: string][] = [
  ["Bengaluru", "Karnataka"],
  ["Mumbai", "Maharashtra"],
  ["Pune", "Maharashtra"],
  ["Hyderabad", "Telangana"],
  ["Chennai", "Tamil Nadu"],
  ["Ahmedabad", "Gujarat"],
  ["Jaipur", "Rajasthan"],
  ["Lucknow", "Uttar Pradesh"],
];

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"] as const;

export const BUSINESS_CATEGORIES = [
  "Grocery & Kirana",
  "General Store",
  "Wholesale Provisions",
  "Departmental Store",
  "Electronics & Accessories",
] as const;

const EMPLOYEE_NAMES = [
  "Farhan Sheikh",
  "Nikita Rao",
  "Abhishek Tiwari",
  "Rohini Kulkarni",
] as const;

const AUTOPAY_STATUSES: AutoPayStatus[] = ["active", "active", "active", "pending", "not_set", "active", "active", "pending"];

const MERCHANT_STATUSES: MerchantStatus[] = [
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "restricted",
  "inactive",
];

const KYC_STATUSES: KycStatus[] = [
  "verified",
  "verified",
  "verified",
  "verified",
  "verified",
  "pending",
  "action_required",
  "rejected",
];

const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "active",
  "active",
  "active",
  "active",
  "active",
  "payment_due",
  "grace",
  "restricted",
];

const SUBSCRIPTION_PLANS = ["Starter Monthly", "Growth Monthly", "Growth Annual", "Pro Monthly"] as const;

const rand = createSeededRandom(1001);

export const MERCHANT_COUNT = BUSINESS_NAMES.length;

export const merchants: Merchant[] = BUSINESS_NAMES.map((businessName, index) => {
  const [city, state] = CITY_STATE[index % CITY_STATE.length];
  const ownerName = OWNER_NAMES[index % OWNER_NAMES.length];
  const joinedAt = toIsoDate(addDays(DEMO_TODAY, -(180 + index * 37)));
  const kycStatus = KYC_STATUSES[index % KYC_STATUSES.length];
  const subscriptionStatus = SUBSCRIPTION_STATUSES[index % SUBSCRIPTION_STATUSES.length];
  const autoPayStatus = AUTOPAY_STATUSES[index % AUTOPAY_STATUSES.length];
  const activationFeeStatus: ActivationFeeStatus = index % 6 === 0 ? "pending" : "paid";
  const gstState = (10 + (index % 35)).toString().padStart(2, "0");

  return {
    id: `MER-${1024 + index * 11}`,
    businessName,
    businessCategory: BUSINESS_CATEGORIES[index % BUSINESS_CATEGORIES.length],
    ownerName,
    phone: `+91 98${(10000000 + index * 137931).toString().slice(0, 8)}`,
    email: `${ownerName.toLowerCase().replace(/\s+/g, ".")}@${businessName
      .toLowerCase()
      .replace(/[^a-z]+/g, "")}.example`,
    address: {
      line1: `${12 + index * 4}, ${["MG Road", "Station Road", "Market Street", "Ring Road"][index % 4]}`,
      city,
      state,
      pincode: `${560001 + index * 113}`,
    },
    bank: {
      accountHolderName: ownerName,
      accountMasked: `XXXX XXXX ${1200 + index * 47}`,
      ifsc: `${BANKS[index % BANKS.length].slice(0, 4).toUpperCase()}0${100000 + index * 91}`,
      bankName: pick(rand, BANKS),
      verified: kycStatus === "verified",
    },
    status: MERCHANT_STATUSES[index % MERCHANT_STATUSES.length],
    kycStatus,
    kycLastReviewedAt: toIsoDate(addDays(DEMO_TODAY, -(5 + index * 9))),
    businessPanMasked: `XXXXX${(1000 + index * 61) % 10000}X`,
    gstMasked: `${gstState}XXXXX${(1000 + index * 83) % 10000}X1Z${index % 10}`,
    ownerIdVerified: kycStatus === "verified" || kycStatus === "pending",
    subscriptionStatus,
    subscriptionPlan: SUBSCRIPTION_PLANS[index % SUBSCRIPTION_PLANS.length],
    activationFeeStatus,
    autoPayStatus,
    nextDebitDate:
      subscriptionStatus === "restricted" ? null : toIsoDate(addDays(DEMO_TODAY, 3 + (index % 20))),
    assignedEmployeeName: EMPLOYEE_NAMES[index % EMPLOYEE_NAMES.length],
    branchCount: 1 + (index % 3),
    joinedAt,
  };
});

export function getMerchantById(merchantId: string): Merchant | undefined {
  return merchants.find((merchant) => merchant.id === merchantId);
}
