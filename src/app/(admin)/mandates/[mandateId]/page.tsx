import { notFound } from "next/navigation";
import { getMandateById } from "@/data/admin";
import { MandateDetailView } from "@/components/mandates/MandateDetailView";

const VALID_TABS = ["overview", "attempts", "activity"];

export default async function MandateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ mandateId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { mandateId } = await params;
  const { tab } = await searchParams;

  if (!getMandateById(mandateId)) notFound();

  const defaultTab = VALID_TABS.includes(tab ?? "") ? (tab as string) : "overview";

  return <MandateDetailView mandateId={mandateId} defaultTab={defaultTab} />;
}
