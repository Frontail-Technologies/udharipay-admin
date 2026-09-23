import { KycReviewDetailView } from "@/features/kyc/components/KycReviewDetailView";

export default async function KycReviewPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = await params;

  return <KycReviewDetailView reviewId={reviewId} />;
}
