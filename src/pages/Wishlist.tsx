import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingBag, Trash2, ArrowRight, X } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import SEO from "@/components/SEO";

export default function Wishlist() {
  const { t } = useTranslation();
  const { items, removeItem, clearAll } = useWishlist();
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleAddToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      moq: 100,
    });
    setAddedIds((prev) => new Set(prev).add(item.productId));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.productId);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t("wishlist.title", "My Wishlist")} />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-12 pt-24 lg:pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">{t("wishlist.label", "Saved")}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{t("wishlist.title", "My Wishlist")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{items.length} {items.length === 1 ? t("wishlist.item", "item") : t("wishlist.items", "items")}</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <Trash2 size={14} /> {t("wishlist.clear", "Clear All")}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{t("wishlist.empty", "Your wishlist is empty")}</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{t("wishlist.emptyDesc", "Save products you like by clicking the heart icon while browsing.")}</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              {t("wishlist.browse", "Browse Products")} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => (
              <div key={item.productId} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300">
                <Link to={`/shop/${item.slug}`} className="block relative aspect-square bg-secondary/50 overflow-hidden">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.productId);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  >
                    <X size={14} />
                  </button>
                </Link>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2">{item.name}</h3>
                  <p className="mt-1 text-base font-semibold text-primary">${item.price.toFixed(2)}</p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
                      addedIds.has(item.productId)
                        ? "bg-green-500 text-white"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    <ShoppingBag size={14} />
                    {addedIds.has(item.productId) ? t("wishlist.added", "Added") : t("wishlist.addToCart", "Add to Cart")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
