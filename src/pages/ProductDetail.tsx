import { useState } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Truck, Shield, RotateCcw, Minus, Plus, Check, Star, Heart, ArrowLeft } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import ProductCard from "@/components/ProductCard";
import CountdownTimer from "@/components/CountdownTimer";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEO from "@/components/SEO";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  image: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  brandName: string | null;
  rating: string | null;
  reviewCount: number | null;
  colors: string | null;
  tags: string | null;
  moq: number | null;
}

// Static fallback products for deployment without backend
const staticProducts: Product[] = [
  {
    id: 1, name: "Portable Bluetooth Speaker", slug: "portable-bluetooth-speaker",
    description: "High-quality portable Bluetooth speaker with 360-degree sound. 12-hour battery life. IPX5 water-resistant. Perfect for outdoor events and bulk orders.",
    price: "0.50", compareAtPrice: "1.20", image: "/products/speaker.jpg",
    categoryId: 1, categoryName: "Electronics", categorySlug: "electronics", brandName: "SoundMax",
    rating: "4.5", reviewCount: 89, colors: "Black,Blue,Red", tags: "bluetooth,speaker,portable,audio", moq: 10,
  },
  {
    id: 2, name: "USB-C Fast Charging Cable", slug: "usb-c-fast-charging-cable",
    description: "Braided nylon USB-C to USB-A cable. 3A fast charging. 6ft length. 10,000+ bend lifespan. Ideal for retail bundles.",
    price: "0.80", compareAtPrice: "1.50", image: "/products/usb-cable.jpg",
    categoryId: 1, categoryName: "Electronics", categorySlug: "electronics", brandName: "PowerLink",
    rating: "4.2", reviewCount: 234, colors: "White,Black", tags: "usb-c,cable,charging,fast-charge", moq: 50,
  },
  {
    id: 3, name: "Wireless Earbuds Pro", slug: "wireless-earbuds-pro",
    description: "True wireless earbuds with active noise cancellation. 30-hour total battery with case. Bluetooth 5.3. Touch controls. Premium sound quality.",
    price: "3.50", compareAtPrice: "8.00", image: "/products/earbuds.jpg",
    categoryId: 3, categoryName: "Audio", categorySlug: "audio", brandName: "AudioTech",
    rating: "4.3", reviewCount: 156, colors: "White,Black,Rose Gold", tags: "earbuds,wireless,anc,bluetooth", moq: 30,
  },
  {
    id: 4, name: "LED Desk Lamp", slug: "led-desk-lamp",
    description: "Adjustable LED desk lamp with 3 color temperatures and 5 brightness levels. USB charging port. Eye-care technology. Modern minimalist design.",
    price: "2.80", compareAtPrice: "5.50", image: "/products/desk-lamp.jpg",
    categoryId: 4, categoryName: "Home & Office", categorySlug: "home-office", brandName: "LumiHome",
    rating: "4.1", reviewCount: 78, colors: "White,Black,Silver", tags: "led,lamp,desk,office", moq: 25,
  },
  {
    id: 5, name: "Stainless Steel Water Bottle", slug: "stainless-steel-water-bottle",
    description: "Double-wall vacuum insulated 500ml water bottle. Keeps drinks cold 24h, hot 12h. BPA-free. Leak-proof lid. Perfect for corporate gifting.",
    price: "1.50", compareAtPrice: "3.00", image: "/products/water-bottle.jpg",
    categoryId: 4, categoryName: "Home & Office", categorySlug: "home-office", brandName: "HydroLife",
    rating: "4.6", reviewCount: 312, colors: "Silver,Black,Blue,Green", tags: "bottle,water,insulated,steel", moq: 20,
  },
  {
    id: 6, name: "Wireless Phone Charger Pad", slug: "wireless-phone-charger-pad",
    description: "15W fast wireless charging pad. Compatible with iPhone and Android. LED indicator. Non-slip surface. Compact design for any desk or nightstand.",
    price: "1.20", compareAtPrice: "2.50", image: "/products/charger-pad.jpg",
    categoryId: 1, categoryName: "Electronics", categorySlug: "electronics", brandName: "ChargeBase",
    rating: "4.0", reviewCount: 189, colors: "Black,White", tags: "charger,wireless,pad,qi", moq: 40,
  },
  {
    id: 7, name: "Noise Cancelling Headphones", slug: "noise-cancelling-headphones",
    description: "Over-ear active noise cancelling headphones. 40-hour battery life. Hi-Res audio certified. Memory foam ear cushions. Foldable design with travel case.",
    price: "5.00", compareAtPrice: "12.00", image: "/products/headphones.jpg",
    categoryId: 3, categoryName: "Audio", categorySlug: "audio", brandName: "AudioTech",
    rating: "4.7", reviewCount: 67, colors: "Black,Silver,Navy", tags: "headphones,anc,over-ear,bluetooth", moq: 15,
  },
  {
    id: 8, name: "Portable Phone Stand", slug: "portable-phone-stand",
    description: "Aluminum foldable phone and tablet stand. Adjustable angle. Non-slip base. Compatible with 4-12 inch devices. Pocket-sized when folded.",
    price: "0.60", compareAtPrice: "1.20", image: "/products/phone-stand.jpg",
    categoryId: 1, categoryName: "Electronics", categorySlug: "electronics", brandName: "DeskMate",
    rating: "3.9", reviewCount: 445, colors: "Silver,Black,Rose Gold", tags: "stand,phone,tablet,aluminum", moq: 60,
  },
  {
    id: 9, name: "Bluetooth Mini Keyboard", slug: "bluetooth-mini-keyboard",
    description: "Compact Bluetooth 5.0 keyboard with scissor-switch keys. Rechargeable battery lasts 60 days. Multi-device pairing. Perfect for tablets and phones.",
    price: "2.20", compareAtPrice: "4.50", image: "/products/keyboard.jpg",
    categoryId: 1, categoryName: "Electronics", categorySlug: "electronics", brandName: "TypePro",
    rating: "4.0", reviewCount: 98, colors: "White,Black,Pink", tags: "keyboard,bluetooth,mini,wireless", moq: 25,
  },
  {
    id: 10, name: "Smart Watch Fitness Tracker", slug: "smart-watch-fitness-tracker",
    description: "Full-touch smartwatch with heart rate monitor, SpO2, sleep tracking. 7-day battery. IP68 waterproof. 100+ sport modes. Notification sync.",
    price: "4.00", compareAtPrice: "9.00", image: "/products/smartwatch.jpg",
    categoryId: 1, categoryName: "Electronics", categorySlug: "electronics", brandName: "FitTech",
    rating: "4.4", reviewCount: 203, colors: "Black,Blue,Pink", tags: "smartwatch,fitness,tracker,health", moq: 20,
  },
];

export default function ProductDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(100);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [imgError, setImgError] = useState(false);

  const { data: rawProduct, isLoading, isError } = trpc.product.bySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug, retry: false }
  );

  // Always check static fallback regardless of API state
  const staticFallback = slug ? staticProducts.find((p) => p.slug === slug) ?? null : null;

  // Use API product or fall back to static products
  const apiProduct: Product | null = rawProduct
    ? {
        id: rawProduct.id,
        name: rawProduct.name,
        slug: rawProduct.slug,
        description: rawProduct.description,
        price: rawProduct.price,
        compareAtPrice: rawProduct.compareAtPrice,
        image: rawProduct.image || "/placeholder.png",
        categoryId: rawProduct.categoryId,
        categoryName: rawProduct.categoryName,
        categorySlug: rawProduct.categorySlug,
        brandName: rawProduct.brandName,
        rating: rawProduct.rating,
        reviewCount: rawProduct.reviewCount,
        colors: rawProduct.colors,
        tags: rawProduct.tags,
        moq: rawProduct.moq,
      }
    : null;

  const product: Product | null = apiProduct || staticFallback;
  const isStaticProduct = !!staticFallback && !apiProduct;

  const { data: relatedResult } = trpc.product.list.useQuery(
    { categoryId: product?.categoryId ?? undefined },
    { enabled: !!product?.categoryId && !isStaticProduct, retry: false }
  );

  const related = relatedResult?.items?.filter((p) => p.id !== product?.id).slice(0, 4) ?? [];

  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  const moq = product?.moq ?? 100;
  const step = moq >= 10 ? 10 : 1;

  const handleAddToCart = () => {
    if (!product) return;
    // Pass the selected quantity, not just MOQ
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "/placeholder.png",
      moq,
    });
    // Update cart item quantity to the selected amount
    const { items, updateQuantity } = useCart.getState();
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      updateQuantity(product.id, quantity);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading && !isStaticProduct) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl text-foreground">{t("product.notFound", "Product not found")}</h2>
          <Link
            to="/shop"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            {t("product.backToShop", "Back to Shop")}
          </Link>
        </div>
      </div>
    );
  }

  const rating = Number(product.rating) || 0;
  const colors = product.colors?.split(",").filter(Boolean) ?? [];
  const savings = product.compareAtPrice
    ? Number(product.compareAtPrice) - Number(product.price)
    : 0;
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${product.name} - BulkHub`} description={product.description ?? undefined} />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-12">
        <Breadcrumbs
          items={[
            { label: "Shop", path: "/shop" },
            ...(product.categoryName
              ? [{ label: product.categoryName, path: `/shop?category=${product.categorySlug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <Link
          to="/shop"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> {t("product.backToShop", "Back to Shop")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-square bg-card rounded-xl border border-border overflow-hidden flex items-center justify-center p-8">
            <img
              src={imgError ? "/placeholder.png" : (product.image || "/placeholder.png")}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onError={() => setImgError(true)}
            />
            {product.compareAtPrice && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md">
                {t("product.save", "Save")} ${savings.toFixed(2)}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Link
              to={`/shop?category=${product.categorySlug}`}
              className="text-xs tracking-[0.15em] uppercase text-primary hover:underline mb-3"
            >
              {product.categoryName} {product.brandName && `/ ${product.brandName}`}
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(rating) ? "star-filled" : "star-empty"}
                    fill={s <= Math.round(rating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount} {t("product.reviews", "reviews")})
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-semibold text-primary">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>

            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {product.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.split(",").map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-card border border-input rounded text-[10px] text-muted-foreground tracking-wider uppercase"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && colors[0] !== "RGB" && colors[0] !== "Variety" && colors[0] !== "Multi" && (
              <div className="mt-6">
                <p className="text-sm font-medium text-foreground mb-2">
                  {t("product.color", "Color")}:{" "}
                  <span className="text-muted-foreground">{colors[selectedColor]}</span>
                </p>
                <div className="flex items-center gap-2">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(idx)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === idx ? "border-primary scale-110" : "border-input"
                      }`}
                      style={{
                        backgroundColor:
                          color.toLowerCase() === "white"
                            ? "#f8f8f8"
                            : color.toLowerCase() === "cream"
                            ? "#f5f5dc"
                            : color.toLowerCase() === "rose gold"
                            ? "#b76e79"
                            : color.toLowerCase() === "space gray"
                            ? "#535150"
                            : color.toLowerCase() === "clear"
                            ? "#e8e8e8"
                            : color.toLowerCase(),
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MOQ Notice */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                {t("product.moq", "Minimum Order Quantity")}: {moq} {t("product.units", "units")}
              </p>
              <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60 mt-0.5">
                You must order at least {moq} units of this product.
              </p>
            </div>

            {product.compareAtPrice && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-primary font-medium">
                  {t("deals.limited")} - {t("deals.endsSoon", "Ends Soon")}
                </p>
                <CountdownTimer
                  targetDate={new Date(
                    Date.now() + 3 * 24 * 60 * 60 * 1000
                  ).toISOString()}
                />
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{t("product.quantity", "Quantity")}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(moq, quantity - step))}
                  className="w-8 h-8 flex items-center justify-center rounded border border-input text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                  disabled={quantity <= moq}
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm w-12 text-center text-foreground font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + step)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-input text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-medium tracking-[0.1em] uppercase transition-all active:scale-[0.98] ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={16} /> {t("product.addedToCart", "Added to Cart")}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> {t("product.addToCart", "Add to Cart")}
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  toggleItem({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image || "/placeholder.png",
                  })
                }
                className={`w-12 flex items-center justify-center rounded-lg border transition-colors ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3 p-4 bg-card rounded-xl border border-border">
              {[
                { icon: Truck, label: t("benefits.shipping"), desc: t("benefits.shippingDesc") },
                { icon: Shield, label: t("benefits.secure"), desc: t("benefits.secureDesc") },
                { icon: RotateCcw, label: t("benefits.returns"), desc: t("benefits.returnsDesc") },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon
                    size={20}
                    className="mx-auto text-primary mb-1.5"
                  />
                  <p className="text-[10px] text-foreground font-medium">
                    {item.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product && <ReviewsSection productId={product.id} />}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {t("product.related", "You May Also Like")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p as unknown as Product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reviews Section Component
function ReviewsSection({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = trpc.reviews.byProduct.useQuery({ productId });
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.byProduct.invalidate({ productId });
      setSubmitted(true);
      setReviewerName("");
      setReviewTitle("");
      setReviewContent("");
      setReviewRating(5);
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewContent.trim()) return;
    createReview.mutate({
      productId,
      customerName: reviewerName.trim(),
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      content: reviewContent.trim(),
    });
  };

  const avgRating = data?.averageRating ?? 0;
  const reviewCount = data?.count ?? 0;

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("product.reviewsTitle", "Customer Reviews")}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={s <= Math.round(avgRating) ? "star-filled" : "star-empty"}
                  fill={s <= Math.round(avgRating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {avgRating > 0 ? `${avgRating} out of 5` : t("product.noReviewsYet", "No reviews yet")}
            </span>
            {reviewCount > 0 && (
              <span className="text-sm text-muted-foreground">({reviewCount} {reviewCount === 1 ? t("product.reviewSingular", "review") : t("product.reviews")})</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? t("common.cancel", "Cancel") : t("product.writeReview", "Write a Review")}
        </button>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-card border border-border rounded-xl space-y-4">
          {submitted && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {t("product.reviewSubmitted", "Thank you! Your review has been submitted.")}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">{t("product.yourName", "Your Name")} *</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("product.namePlaceholder", "Enter your name")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">{t("product.rating", "Rating")}</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={star <= reviewRating ? "star-filled" : "star-empty"}
                    fill={star <= reviewRating ? "currentColor" : "none"}
                  />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">{reviewRating}/5</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">{t("product.reviewTitle", "Review Title")}</label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("product.titlePlaceholder", "Summarize your experience")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">{t("product.reviewContent", "Review")} *</label>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder={t("product.contentPlaceholder", "Tell us about your experience with this product...")}
            />
          </div>
          <button
            type="submit"
            disabled={createReview.isPending}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createReview.isPending ? t("common.submitting", "Submitting...") : t("product.submitReview", "Submit Review")}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-card border border-border rounded-xl animate-pulse">
              <div className="h-4 w-32 bg-secondary rounded mb-2" />
              <div className="h-3 w-full bg-secondary rounded mb-1" />
              <div className="h-3 w-2/3 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div className="space-y-4">
          {data.items.map((review) => (
            <div key={review.id} className="p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{review.customerName}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= review.rating ? "star-filled" : "star-empty"}
                          fill={s <= review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.title && (
                <h4 className="text-sm font-semibold text-foreground mb-1">{review.title}</h4>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-card border border-border rounded-xl">
          <p className="text-sm text-muted-foreground">{t("product.beFirstReview", "Be the first to review this product!")}</p>
        </div>
      )}
    </div>
  );
}
