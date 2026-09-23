import { MandateDetailView } from "@/features/mandates/components/MandateDetailView";

const VALID_TABS = ["overview", "attempts"];

export default async function MandateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ mandateId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { mandateId } = await params;
  const { tab } = await searchParams;

  const defaultTab = VALID_TABS.includes(tab ?? "") ? (tab as string) : "overview";

  return <MandateDetailView mandateId={mandateId} defaultTab={defaultTab} />;
}
