import { notFound } from "next/navigation";
import { getKycReviewById } from "@/data/admin";
import { KycReviewWorkspace } from "@/components/kyc/KycReviewWorkspace";

export default async function KycReviewPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = await params;

  if (!getKycReviewById(reviewId)) notFound();

  return <KycReviewWorkspace reviewId={reviewId} />;
}
