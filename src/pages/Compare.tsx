import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { GitCompare, ShoppingBag, Trash2, ArrowRight, Star, X } from "lucide-react";
import { useCompare } from "@/store/compare";
import { useCart } from "@/store/cart";
import SEO from "@/components/SEO";

export default function Compare() {
  const { t } = useTranslation();
  const { items, removeItem, clearCompare } = useCompare();
  const { addItem } = useCart();

  const handleAddToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image || "/placeholder.png",
      moq: 100,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t("compare.title", "Compare Products")} />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-12 pt-24 lg:pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">{t("compare.label", "Comparison")}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{t("compare.title", "Compare Products")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{items.length} {items.length === 1 ? t("compare.item", "item") : t("compare.items", "items")}</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearCompare} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <Trash2 size={14} /> {t("compare.clear", "Clear All")}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <GitCompare size={32} className="text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{t("compare.empty", "No products to compare")}</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{t("compare.emptyDesc", "Add products to compare by clicking the compare icon while browsing.")}</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              {t("compare.browse", "Browse Products")} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-card border border-border text-xs font-medium text-muted-foreground w-32">{t("compare.feature", "Feature")}</th>
                  {items.map((item) => (
                    <th key={item.productId} className="px-4 py-3 bg-card border border-border min-w-[200px]">
                      <div className="text-center">
                        <Link to={`/shop/${item.slug || item.productId}`}>
                          <img src={item.image || "/placeholder.png"} alt={item.name} className="w-16 h-16 object-cover rounded-lg mx-auto mb-2" />
                        </Link>
                        <p className="text-xs font-medium text-foreground line-clamp-2">{item.name}</p>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="mt-2 text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
                        >
                          <X size={10} /> {t("compare.remove", "Remove")}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 border border-border bg-card/50 text-xs font-medium text-muted-foreground">{t("compare.price", "Price")}</td>
                  {items.map((item) => (
                    <td key={item.productId} className="px-4 py-3 border border-border text-center text-primary font-semibold">${item.price.toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-border bg-card/50 text-xs font-medium text-muted-foreground">{t("compare.rating", "Rating")}</td>
                  {items.map((item) => (
                    <td key={item.productId} className="px-4 py-3 border border-border text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= Math.round(item.rating) ? "star-filled" : "star-empty"} fill={s <= Math.round(item.rating) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">({item.reviewCount ?? 0})</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-border bg-card/50 text-xs font-medium text-muted-foreground">{t("compare.category", "Category")}</td>
                  {items.map((item) => (
                    <td key={item.productId} className="px-4 py-3 border border-border text-center text-xs text-muted-foreground">{item.categoryName || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-border bg-card/50 text-xs font-medium text-muted-foreground">{t("compare.colors", "Colors")}</td>
                  {items.map((item) => (
                    <td key={item.productId} className="px-4 py-3 border border-border text-center text-xs text-muted-foreground">{item.colors || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-border bg-card/50 text-xs font-medium text-muted-foreground">{t("compare.description", "Description")}</td>
                  {items.map((item) => (
                    <td key={item.productId} className="px-4 py-3 border border-border text-center text-xs text-muted-foreground max-w-[200px]">{item.description || "—"}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-border bg-card/50 text-xs font-medium text-muted-foreground"></td>
                  {items.map((item) => (
                    <td key={item.productId} className="px-4 py-3 border border-border text-center">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-all active:scale-[0.98]"
                      >
                        <ShoppingBag size={12} /> {t("compare.addToCart", "Add to Cart")}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
