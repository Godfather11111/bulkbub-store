import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Heart, GitCompare, Eye, Star } from "lucide-react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useCompare } from "@/store/compare";
import LazyImage from "@/components/LazyImage";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
  rating: string | null;
  reviewCount: number | null;
  colors: string | null;
  moq: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  brandName: string | null;
  description: string | null;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = useState(0);
  const [imgHover, setImgHover] = useState(false);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { addItem: addToCompare, isInCompare: checkCompare } = useCompare();

  const colors = product.colors?.split(",").filter(Boolean) ?? [];
  const rating = Number(product.rating) || 0;
  const isWishlisted = isInWishlist(product.id);
  const isCompared = checkCompare(product.id);
  const moq = product.moq ?? 100;
  const image = product.image || "/placeholder.png";

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image,
      moq,
    });
  };

  return (
    <div
      className="group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setImgHover(true)}
      onMouseLeave={() => setImgHover(false)}
    >
      {/* Image */}
      <Link to={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-secondary/50">
        <LazyImage
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.compareAtPrice && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
            {t("product.sale", "Sale")}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-[9px] font-bold px-2 py-1 rounded-md tracking-wider uppercase border border-border">
          {t("shop.moq")}: {moq}
        </span>

        {/* Hover actions */}
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-all duration-300 ${
          imgHover ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem({ productId: product.id, slug: product.slug, name: product.name, price: Number(product.price), image });
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-95 z-20 ${
              isWishlisted ? "bg-red-500 text-white" : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
            title={isWishlisted ? t("product.removeWishlist", "Remove from wishlist") : t("product.addWishlist", "Add to wishlist")}
          >
            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isCompared) {
                addToCompare({
                  productId: product.id,
                  name: product.name,
                  price: Number(product.price),
                  image,
                  categoryName: product.categoryName || "",
                  rating,
                  reviewCount: product.reviewCount,
                  colors: product.colors || "",
                  description: product.description || "",
                });
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-95 ${
              isCompared ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
            title={t("product.compare", "Compare")}
          >
            <GitCompare size={15} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-9 h-9 rounded-full bg-card text-foreground flex items-center justify-center shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110 active:scale-95"
              title={t("product.quickView", "Quick view")}
            >
              <Eye size={15} />
            </button>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">
          {product.categoryName}
          {product.brandName && ` / ${product.brandName}`}
        </p>

        {/* Name */}
        <Link to={`/shop/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= Math.round(rating) ? "star-filled" : "star-empty"}
                fill={star <= Math.round(rating) ? "currentColor" : "none"}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Color swatches */}
        {colors.length > 0 && colors[0] !== "RGB" && colors[0] !== "Variety" && colors[0] !== "Multi" && (
          <div className="flex items-center gap-1.5 mt-2">
            {colors.slice(0, 5).map((color, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(idx)}
                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColor === idx ? "border-primary scale-110" : "border-border"
                }`}
                style={{
                  backgroundColor:
                    color.toLowerCase() === "white" || color.toLowerCase() === "cream"
                      ? "#f5f5dc"
                      : color.toLowerCase() === "tortoise"
                      ? "#8b6f47"
                      : color.toLowerCase() === "rose gold"
                      ? "#b76e79"
                      : color.toLowerCase() === "space gray"
                      ? "#535150"
                      : color.toLowerCase() === "navy"
                      ? "#1e3a5f"
                      : color.toLowerCase() === "charcoal"
                      ? "#36454f"
                      : color.toLowerCase() === "olive"
                      ? "#556b2f"
                      : color.toLowerCase() === "teal"
                      ? "#008080"
                      : color.toLowerCase() === "blush"
                      ? "#de5d83"
                      : color.toLowerCase() === "beige"
                      ? "#f5f5dc"
                      : color.toLowerCase() === "tan"
                      ? "#d2b48c"
                      : color.toLowerCase() === "clear"
                      ? "#e8e8e8"
                      : color.toLowerCase(),
                }}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-primary">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110 active:scale-95"
            title={t("product.addToCart", "Add to cart")}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}