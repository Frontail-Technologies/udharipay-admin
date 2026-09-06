import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import { merchants } from "./merchants";
import type { Customer, MandateStatus, KycStatus, IdType, MandateMethod } from "./types";

const FIRST_NAMES = [
  "Arjun",
  "Sunita",
  "Manoj",
  "Deepa",
  "Rahul",
  "Pooja",
  "Amit",
  "Neha",
  "Vivek",
  "Sneha",
  "Karan",
  "Divya",
] as const;

const LAST_NAMES = [
  "Reddy",
  "Joshi",
  "Verma",
  "Menon",
  "Malhotra",
  "Chauhan",
  "Bhat",
  "Rao",
  "Kapoor",
  "Pillai",
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

const MANDATE_STATUSES: MandateStatus[] = ["active", "active", "active", "pending", "not_set", "failed"];
const VERIFICATION_STATUSES: KycStatus[] = ["verified", "verified", "verified", "pending", "action_required"];
const ID_TYPES: IdType[] = ["Aadhaar", "Aadhaar", "Voter ID", "Driving License"];

function mandateMethodFor(mandateStatus: MandateStatus): MandateMethod {
  if (mandateStatus === "not_set") return "Not Set";
  return mandateStatus === "failed" ? "NACH" : "UPI Autopay";
}

function customerCountForMerchant(merchantIndex: number): number {
  return 3 + (merchantIndex % 3);
}

export const customers: Customer[] = merchants.flatMap((merchant, merchantIndex) => {
  const count = customerCountForMerchant(merchantIndex);

  return Array.from({ length: count }, (_, localIndex) => {
    const globalIndex = merchantIndex * 10 + localIndex;
    const firstName = FIRST_NAMES[globalIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(globalIndex * 3) % LAST_NAMES.length];
    const [city, state] = CITY_STATE[globalIndex % CITY_STATE.length];
    const joinedAt = toIsoDate(addDays(DEMO_TODAY, -(20 + globalIndex * 13)));
    const panSuffix = (1000 + globalIndex * 37) % 10000;
    const idSuffix = (1000 + globalIndex * 53) % 10000;
    const idType = ID_TYPES[globalIndex % ID_TYPES.length];
    const mandateStatus = MANDATE_STATUSES[globalIndex % MANDATE_STATUSES.length];

    return {
      id: `CUS-${2048 + globalIndex * 7}`,
      merchantId: merchant.id,
      name: `${firstName} ${lastName}`,
      phone: `+91 9${(700000000 + globalIndex * 91234).toString().slice(0, 9)}`,
      alternatePhone: globalIndex % 4 === 0 ? `+91 8${(600000000 + globalIndex * 62345).toString().slice(0, 9)}` : null,
      address: {
        line1: `${5 + globalIndex}, ${["Gandhi Nagar", "Shastri Colony", "Nehru Layout", "Vivekananda Street"][globalIndex % 4]}`,
        city,
        state,
        pincode: `${560010 + globalIndex * 71}`,
      },
      verificationStatus: VERIFICATION_STATUSES[globalIndex % VERIFICATION_STATUSES.length],
      panMasked: `XXXXX${panSuffix.toString().padStart(4, "0")}X`,
      idType,
      idReferenceMasked:
        idType === "Aadhaar" ? `XXXX XXXX ${idSuffix.toString().padStart(4, "0")}` : `XX${idSuffix.toString().padStart(4, "0")}XX`,
      mandateStatus,
      mandateMethod: mandateMethodFor(mandateStatus),
      mandateAuthorizedAt:
        mandateStatus === "active" ? toIsoDate(addDays(DEMO_TODAY, -(30 + globalIndex * 5))) : null,
      accountFlag: globalIndex % 17 === 0 ? "restricted" : null,
      joinedAt,
    } satisfies Customer;
  });
});

export function getCustomerById(customerId: string): Customer | undefined {
  return customers.find((customer) => customer.id === customerId);
}

export function getCustomersByMerchant(merchantId: string): Customer[] {
  return customers.filter((customer) => customer.merchantId === merchantId);
}
