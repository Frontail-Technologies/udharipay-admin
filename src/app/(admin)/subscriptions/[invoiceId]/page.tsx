import { InvoiceDetailView } from "@/features/billing/components/InvoiceDetailView";

export default async function SubscriptionInvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  return <InvoiceDetailView invoiceId={invoiceId} />;
}
