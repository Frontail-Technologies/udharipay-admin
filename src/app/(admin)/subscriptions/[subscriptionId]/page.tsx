import { notFound } from "next/navigation";
import { getSubscriptionById } from "@/data/admin";
import { SubscriptionDetailView } from "@/components/subscriptions/SubscriptionDetailView";

const VALID_TABS = ["overview", "billing", "activity"];

export default async function SubscriptionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ subscriptionId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { subscriptionId } = await params;
  const { tab } = await searchParams;

  if (!getSubscriptionById(subscriptionId)) notFound();

  const defaultTab = VALID_TABS.includes(tab ?? "") ? (tab as string) : "overview";

  return <SubscriptionDetailView subscriptionId={subscriptionId} defaultTab={defaultTab} />;
}
