import { getPaymentPlans } from "@/lib/actions/payment-plan.actions";
import { PaymentManager } from "@/components/payments/PaymentManager";

export const metadata = {
  title: "Budgeting Pembayaran - Cashflow",
};

export default async function PaymentsPage() {
  const rawPlans = await getPaymentPlans();
  
  // Transform dates to ensure compatibility with client components
  const plans = rawPlans.map((p) => ({
    ...p,
    dueDate: p.dueDate.toISOString(),
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-0">
      <PaymentManager plans={plans as any} />
    </div>
  );
}
