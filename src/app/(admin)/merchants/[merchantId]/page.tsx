import { notFound } from "next/navigation";
import { getMerchantById } from "@/data/admin";
import { MerchantDetailView } from "@/components/merchants/MerchantDetailView";

const VALID_TABS = ["overview", "customers", "collections", "kyc", "subscription"];

export default async function MerchantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ merchantId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { merchantId } = await params;
  const { tab } = await searchParams;

  // Cheap existence check only — display data all flows through the
  // canonical client-side selectors so it reflects live demo edits.
  if (!getMerchantById(merchantId)) notFound();

  const defaultTab = VALID_TABS.includes(tab ?? "") ? (tab as string) : "overview";

  return <MerchantDetailView merchantId={merchantId} defaultTab={defaultTab} />;
}
