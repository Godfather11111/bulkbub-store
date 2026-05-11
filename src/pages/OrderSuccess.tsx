import { Link, useSearchParams } from "react-router";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { trpc } from "@/providers/trpc";
import SEO from "@/components/SEO";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get("orderId"));

  const { data: order, isLoading } = trpc.payment.getOrder.useQuery(
    { orderId },
    { enabled: orderId > 0 }
  );

  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-24 flex items-center justify-center">
      <SEO title="Order Confirmed - BulkHub" />
      <div className="w-full max-w-lg mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Order Confirmed!
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Thank you for your purchase. Your order has been successfully placed
          and is being processed.
        </p>

        {isLoading ? (
          <div className="mt-8 p-5 bg-card rounded-xl border border-border animate-pulse">
            <div className="h-4 w-32 bg-secondary rounded mx-auto" />
          </div>
        ) : order ? (
          <div className="mt-8 p-5 bg-card rounded-xl border border-border text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">Order ID</span>
              <span className="text-sm font-mono text-foreground">
                #{order.id.toString().padStart(6, "0")}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded capitalize">
                {order.status}
              </span>
            </div>
            {order.customerEmail && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground">Email</span>
                <span className="text-sm text-foreground">
                  {order.customerEmail}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-2">Items</p>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName || ""}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <span className="text-xs text-foreground">
                        {item.productName}
                        <span className="text-muted-foreground">
                          {" "}x{item.quantity}
                        </span>
                      </span>
                    </div>
                    <span className="text-xs text-primary font-medium">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-4 mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-lg font-semibold text-primary">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        ) : null}

        {/* What happens next */}
        <div className="mt-8 p-5 bg-card rounded-xl border border-border text-left">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-primary" />
            <h3 className="text-sm font-medium text-foreground">
              What happens next?
            </h3>
          </div>
          <ul className="space-y-3">
            {[
              "You will receive an order confirmation email shortly",
              "We will process and ship your order within 1-2 business days",
              "You will receive tracking information once your order ships",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/shop"
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-[0.1em] uppercase hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-3 border border-input text-foreground rounded-lg text-sm tracking-[0.1em] uppercase hover:border-primary transition-colors"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
