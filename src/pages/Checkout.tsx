import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Lock, CreditCard, AlertCircle,
  Truck, Shield, RotateCcw,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/store/cart";
import { trpc } from "@/providers/trpc";
import SEO from "@/components/SEO";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function CheckoutForm({
  clientSecret: _clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const confirmOrder = trpc.payment.confirmOrder.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.");
    } else {
      confirmOrder.mutate({ orderId });
      clearCart();
      navigate("/order-success");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment methods info */}
      <div className="p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-primary" />
          <h3 className="text-sm font-medium text-foreground">
            Payment Method
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Secure payment powered by Stripe. We accept:
        </p>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {["Visa", "Mastercard", "PayPal", "Alipay", "WeChat Pay"].map(
            (method) => (
              <span
                key={method}
                className="px-2 py-1 bg-secondary border border-border rounded text-[10px] text-muted-foreground font-medium"
              >
                {method}
              </span>
            )
          )}
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <PaymentElement
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-[0.1em] uppercase hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        <Lock size={14} />
        {isProcessing ? "Processing..." : "Pay Securely"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { t } = useTranslation();
  const { items, getTotalPrice } = useCart();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const createPaymentIntent = trpc.payment.createPaymentIntent.useMutation();

  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    orderId: number;
  } | null>(null);

  const handleContinueToPayment = useCallback(async () => {
    if (items.length === 0) return;

    const result = await createPaymentIntent.mutateAsync({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      customerEmail: customerEmail || undefined,
      customerName: customerName || undefined,
    });

    setPaymentData(result);
    setShowPayment(true);
  }, [items, customerEmail, customerName, createPaymentIntent]);

  if (items.length === 0 && !paymentData) {
    return (
      <div className="pt-20 lg:pt-24 min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl text-foreground">Your cart is empty</h2>
          <Link
            to="/shop"
            className="mt-4 text-sm text-primary hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-background">
      <SEO title="Checkout - BulkHub" />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-12">
        {/* Header */}
        <Link
          to="/shop"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Shop
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Payment */}
          <div className="lg:col-span-2 space-y-6">
            {!showPayment ? (
              <>
                {/* Customer Info */}
                <div className="p-5 bg-card rounded-xl border border-border">
                  <h3 className="text-sm font-medium text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="john@bulkhub.store"
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Truck, label: t("benefits.shipping"), desc: t("benefits.shippingDesc") },
                    { icon: Shield, label: t("benefits.secure"), desc: t("benefits.secureDesc") },
                    { icon: RotateCcw, label: t("benefits.returns"), desc: t("benefits.returnsDesc") },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-lg border border-border text-center">
                      <item.icon size={18} className="text-primary" />
                      <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                      <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Continue button */}
                <button
                  onClick={handleContinueToPayment}
                  disabled={createPaymentIntent.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-[0.1em] uppercase hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <Lock size={14} />
                  {createPaymentIntent.isPending
                    ? "Preparing..."
                    : "Continue to Payment"}
                </button>

                {createPaymentIntent.isError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    <AlertCircle size={16} />
                    {createPaymentIntent.error.message}
                  </div>
                )}
              </>
            ) : paymentData ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: paymentData.clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "hsl(var(--primary))",
                      colorBackground: "hsl(var(--card))",
                      colorText: "hsl(var(--foreground))",
                      colorDanger: "#ef4444",
                      borderRadius: "8px",
                      spacingUnit: "4px",
                    },
                  },
                }}
              >
                <CheckoutForm
                  clientSecret={paymentData.clientSecret}
                  orderId={paymentData.orderId}
                />
              </Elements>
            ) : null}
          </div>

          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
              <h3 className="text-sm font-medium text-foreground mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg bg-secondary/50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
