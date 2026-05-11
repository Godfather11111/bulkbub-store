import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { X, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react";
import { useCart } from "@/store/cart";

export default function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDecrease = (item: typeof items[0]) => {
    const moq = item.moq || 100;
    const step = moq >= 10 ? 10 : 1;
    const newQty = item.quantity - step;
    if (newQty < moq) {
      // Show removal confirmation
      setRemovingId(item.productId);
      setTimeout(() => setRemovingId(null), 2000);
      return;
    }
    updateQuantity(item.productId, newQty);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[100vw] sm:max-w-md bg-card border-l border-border flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-sm tracking-[0.15em] uppercase font-medium text-foreground">{t("cart.title", "Shopping Cart")} ({items.length})</h2>
          <button onClick={() => setIsOpen(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
        </div>

        {/* MOQ Notice */}
        {items.length > 0 && (
          <div className="px-5 py-2.5 bg-primary/5 border-b border-border flex items-center gap-2">
            <AlertTriangle size={14} className="text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">{t("cart.moqNote", "MOQ is 100 units per product")}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm mb-2">{t("cart.empty", "Your cart is empty")}</p>
              <button onClick={() => setIsOpen(false)} className="text-primary text-sm hover:underline">{t("cart.continue", "Continue Shopping")}</button>
            </div>
          ) : (
            items.map((item) => {
              const moq = item.moq || 100;
              const step = moq >= 10 ? 10 : 1;
              const isRemoving = removingId === item.productId;
              return (
                <div key={item.productId} className={`flex gap-4 p-3 rounded-lg bg-secondary/50 border transition-all duration-200 ${isRemoving ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-border"}`}>
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                    <p className="text-primary text-sm mt-1 font-medium">${item.price.toFixed(2)} <span className="text-[10px] text-muted-foreground font-normal">/ unit</span></p>
                    <p className="text-[10px] text-primary/70 mt-0.5">{t("shop.moq")}: {moq}</p>

                    {isRemoving ? (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-red-500">{t("cart.removeConfirm", "Remove item?")}</span>
                        <button onClick={() => { removeItem(item.productId); setRemovingId(null); }} className="text-[11px] px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">{t("common.yes", "Yes")}</button>
                        <button onClick={() => setRemovingId(null)} className="text-[11px] px-2 py-1 bg-secondary rounded hover:bg-secondary/80 transition-colors">{t("common.no", "No")}</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleDecrease(item)} className="w-6 h-6 flex items-center justify-center rounded border border-input text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"><Minus size={12} /></button>
                        <span className="text-sm w-10 text-center text-foreground font-medium tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + step)} className="w-6 h-6 flex items-center justify-center rounded border border-input text-muted-foreground hover:text-foreground transition-colors"><Plus size={12} /></button>
                        <button onClick={() => removeItem(item.productId)} className="ml-auto text-muted-foreground hover:text-red-500 transition-colors text-xs">{t("cart.remove", "Remove")}</button>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">{t("cart.lineTotal", "Line total")}: <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span></p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("cart.subtotal", "Subtotal")}</span>
              <span className="text-lg font-medium text-foreground">${getTotalPrice().toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("cart.shippingNote", "Shipping and taxes calculated at checkout")}</p>
            <Link to="/checkout" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-[0.1em] uppercase hover:opacity-90 transition-all active:scale-[0.98]">
              {t("cart.checkout", "Checkout")} <ArrowRight size={16} />
            </Link>
            <button onClick={clearCart} className="w-full py-2 text-xs text-muted-foreground hover:text-red-500 transition-colors">{t("cart.clear", "Clear Cart")}</button>
          </div>
        )}
      </div>
    </>
  );
}