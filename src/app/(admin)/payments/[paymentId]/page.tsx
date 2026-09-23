import { PaymentDetailView } from "@/features/payments/components/PaymentDetailView";

export default async function PaymentDetailPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  return <PaymentDetailView paymentId={paymentId} />;
}
