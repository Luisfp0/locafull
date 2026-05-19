import { OrderPage } from "@/components/order/OrderPage";

type OrderRouteProps = {
  searchParams: Promise<{
    product?: string;
    plan?: string;
  }>;
};

export default async function OrderRoutePage({
  searchParams,
}: OrderRouteProps) {
  const { product: productId, plan: planId } = await searchParams;

  return <OrderPage productId={productId} planId={planId} />;
}
