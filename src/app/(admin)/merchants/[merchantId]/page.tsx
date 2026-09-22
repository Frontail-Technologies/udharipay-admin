import { MerchantDetailView } from "@/features/merchants/components/MerchantDetailView";

export default async function MerchantDetailPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  return <MerchantDetailView merchantId={merchantId} />;
}
