import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import { trpc } from "@/providers/trpc";
import SEO from "@/components/SEO";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  pending: { color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400", icon: Clock },
  processing: { color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400", icon: Loader },
  completed: { color: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400", icon: CheckCircle },
  cancelled: { color: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400", icon: XCircle },
};

export default function OrderHistory() {
  const { t } = useTranslation();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { data: orders, isLoading } = trpc.admin.orders.useQuery({ page: 1, limit: 50 });
  const { data: orderDetail } = trpc.admin.orderDetail.useQuery(
    { id: expandedOrder! },
    { enabled: !!expandedOrder }
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Order History - BulkHub" />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 pt-24 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={14} /> {t("cart.continue")}
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-sm text-muted-foreground mb-8">
            View and track your order history
          </p>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader size={24} className="animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            </div>
          ) : !orders?.items?.length ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-medium text-foreground mb-1">No orders yet</h2>
              <p className="text-sm text-muted-foreground mb-6">
                When you place orders, they will appear here.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.items.map((order: any) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-accent/30 transition-colors"
                    >
                      <div className={`p-2.5 rounded-lg ${status.color}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            Order #{order.id.toString().padStart(6, "0")}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          ${Number(order.total).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {order.items?.length || "?"} items
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>

                    {isExpanded && orderDetail && (
                      <div className="border-t border-border px-5 py-4 bg-secondary/20">
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Customer</p>
                            <p className="text-foreground">{orderDetail.customerName || "Guest"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                            <p className="text-foreground">{orderDetail.customerEmail || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Payment Status</p>
                            <p className="text-foreground capitalize">{orderDetail.paymentStatus}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Order Date</p>
                            <p className="text-foreground">
                              {new Date(orderDetail.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <h4 className="text-xs font-medium text-foreground mb-3">Items</h4>
                        <div className="space-y-2">
                          {orderDetail.items?.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 bg-background border border-input rounded-lg"
                            >
                              <img
                                src={item.productImage || "/placeholder.png"}
                                alt={item.productName}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {item.productName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                </p>
                              </div>
                              <p className="text-xs font-semibold text-primary">
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Shipping address available in confirmation email
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            Total: <span className="text-primary">${Number(orderDetail.total).toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
