import { MerchantDetailView } from "@/components/merchants/MerchantDetailView";

export default async function MerchantDetailPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  return <MerchantDetailView merchantId={merchantId} />;
}
