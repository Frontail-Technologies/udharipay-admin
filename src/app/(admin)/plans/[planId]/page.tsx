import { notFound } from "next/navigation";
import { getPlanById } from "@/data/admin";
import { PlanDetailView } from "@/components/plans/PlanDetailView";

const VALID_TABS = ["overview", "schedule", "payments", "followup"];

export default async function PlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { planId } = await params;
  const { tab } = await searchParams;

  if (!getPlanById(planId)) notFound();

  const defaultTab = VALID_TABS.includes(tab ?? "") ? (tab as string) : "overview";

  return <PlanDetailView planId={planId} defaultTab={defaultTab} />;
}
