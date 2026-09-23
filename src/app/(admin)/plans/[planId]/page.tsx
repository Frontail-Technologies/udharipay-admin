import { PlanDetailView } from "@/features/plans/components/PlanDetailView";

const VALID_TABS = ["overview", "schedule", "payments"];

export default async function PlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { planId } = await params;
  const { tab } = await searchParams;

  const defaultTab = VALID_TABS.includes(tab ?? "") ? (tab as string) : "overview";

  return <PlanDetailView planId={planId} defaultTab={defaultTab} />;
}
