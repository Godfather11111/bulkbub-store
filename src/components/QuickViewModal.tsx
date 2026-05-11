import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { X, ShoppingBag, Heart, Star, Check } from "lucide-react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useQuickView } from "@/store/quickView";

export default function QuickViewModal() {
  const { t } = useTranslation();
  const { product, isOpen, close } = useQuickView();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const rating = Number(product.rating) || 0;
  const colors = product.colors?.split(",").filter(Boolean) ?? [];
  const isWishlisted = isInWishlist(product.id);
  const image = product.image || "/placeholder.png";

  const moq = product.moq ?? 100;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "/placeholder.png",
      moq,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-secondary/50 p-6 flex items-center justify-center">
            <img src={image} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">
              {product.categoryName} {product.brandName && `/ ${product.brandName}`}
            </p>
            <h2 className="text-xl font-bold text-foreground">{product.name}</h2>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= Math.round(rating) ? "star-filled" : "star-empty"} fill={s <= Math.round(rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount} {t("product.reviews", "reviews")})</span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">${Number(product.compareAtPrice).toFixed(2)}</span>
              )}
            </div>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {product.description}
            </p>

            {/* MOQ */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">{t("product.moq")}: {moq} {t("product.units")}</p>
            </div>

            {colors.length > 0 && colors[0] !== "RGB" && colors[0] !== "Variety" && colors[0] !== "Multi" && (
              <div className="mt-4">
                <p className="text-xs font-medium text-foreground mb-2">{t("product.color")}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {colors.map((color, idx) => (
                    <span key={idx} className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground border border-border">{color}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 flex gap-3">
              <button
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium tracking-wider uppercase transition-all ${
                  added ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {added ? <><Check size={16} /> {t("product.added", "Added")}</> : <><ShoppingBag size={16} /> {t("product.addToCart")}</>}
              </button>
              <button
                onClick={() => toggleItem({ productId: product.id, slug: product.slug, name: product.name, price: Number(product.price), image: product.image || "/placeholder.png" })}
                className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors ${
                  isWishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <Link
              to={`/shop/${product.slug}`}
              onClick={close}
              className="mt-3 text-center text-xs text-primary hover:underline tracking-wider uppercase"
            >
              {t("product.viewDetails", "View Full Details")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
