import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { trpc } from "@/providers/trpc";
import ProductCard from "@/components/ProductCard";
import { useQuickView } from "@/store/quickView";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEO from "@/components/SEO";

const PAGE_SIZE = 24;

const sortOptions = [
  { value: "", labelKey: "shop.sortNewest" },
  { value: "price_asc", labelKey: "shop.priceAsc" },
  { value: "price_desc", labelKey: "shop.priceDesc" },
  { value: "rating", labelKey: "shop.rating" },
  { value: "name", labelKey: "shop.name" },
];

export default function Shop() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("");

  const categorySlug = searchParams.get("category");
  const subcategorySlug = searchParams.get("subcategory");

  const { data: categoryData } = trpc.product.categories.useQuery();

  // Static categories fallback for deployment without backend
  const staticCategories = [
    {
      id: 1, name: "Electronics", slug: "electronics",
      subcategories: [
        { id: 11, name: "Phone Accessories", slug: "phone-accessories" },
        { id: 12, name: "Cables & Chargers", slug: "cables-chargers" },
        { id: 13, name: "Smart Devices", slug: "smart-devices" },
        { id: 14, name: "Computer Peripherals", slug: "computer-peripherals" },
      ],
    },
    {
      id: 2, name: "Audio", slug: "audio",
      subcategories: [
        { id: 21, name: "Headphones", slug: "headphones" },
        { id: 22, name: "Speakers", slug: "speakers" },
        { id: 23, name: "Earbuds", slug: "earbuds" },
        { id: 24, name: "Audio Cables", slug: "audio-cables" },
      ],
    },
    {
      id: 3, name: "Home & Office", slug: "home-office",
      subcategories: [
        { id: 31, name: "Desk Accessories", slug: "desk-accessories" },
        { id: 32, name: "Lighting", slug: "lighting" },
        { id: 33, name: "Storage", slug: "storage" },
        { id: 34, name: "Drinkware", slug: "drinkware" },
      ],
    },
    {
      id: 4, name: "Lighting", slug: "lighting-cat",
      subcategories: [
        { id: 41, name: "LED Lights", slug: "led-lights" },
        { id: 42, name: "Desk Lamps", slug: "desk-lamps" },
        { id: 43, name: "Strip Lights", slug: "strip-lights" },
      ],
    },
    {
      id: 5, name: "Accessories", slug: "accessories",
      subcategories: [
        { id: 51, name: "Phone Cases", slug: "phone-cases" },
        { id: 52, name: "Bags & Sleeves", slug: "bags-sleeves" },
        { id: 53, name: "Stands & Holders", slug: "stands-holders" },
      ],
    },
  ];

  const apiCategories = categoryData ?? [];
  const categories = apiCategories.length > 0 ? apiCategories : staticCategories;

  const activeParent = categories.find((c: Record<string, unknown>) => c.slug === categorySlug);
  const activeSub = categories.flatMap((c: Record<string, unknown>) => (c.subcategories as Array<{slug: string; name: string}>) ?? []).find((s) => s.slug === subcategorySlug);

  const parentCategoryId = activeParent?.id;
  const subcategoryId = activeSub?.id;

  const { data: result, isLoading } = trpc.product.list.useQuery({
    categoryId: subcategoryId ? undefined : parentCategoryId,
    subcategoryId: subcategoryId,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
    sort: sort || undefined,
  });

  // Hardcoded products for static deployment (no backend)
  const staticProducts = [
    {
      id: 1,
      name: "Portable Bluetooth Speaker",
      slug: "portable-bluetooth-speaker",
      price: "0.50",
      compareAtPrice: "1.20",
      image: "/products/speaker.jpg",
      rating: "4.5",
      reviewCount: 89,
      colors: "Black,Blue,Red",
      moq: 10,
      categoryName: "Electronics",
      categorySlug: "electronics",
      brandName: "SoundMax",
      description: "High-quality portable Bluetooth speaker with 360-degree sound. 12-hour battery life. IPX5 water-resistant. Perfect for outdoor events and bulk orders.",
    },
    {
      id: 2,
      name: "USB-C Fast Charging Cable",
      slug: "usb-c-fast-charging-cable",
      price: "0.80",
      compareAtPrice: "1.50",
      image: "/products/usb-cable.jpg",
      rating: "4.2",
      reviewCount: 234,
      colors: "White,Black",
      moq: 50,
      categoryName: "Electronics",
      categorySlug: "electronics",
      brandName: "PowerLink",
      description: "Braided nylon USB-C to USB-A cable. 3A fast charging. 6ft length. 10,000+ bend lifespan. Ideal for retail bundles.",
    },
    {
      id: 3,
      name: "Wireless Earbuds Pro",
      slug: "wireless-earbuds-pro",
      price: "3.50",
      compareAtPrice: "8.00",
      image: "/products/earbuds.jpg",
      rating: "4.3",
      reviewCount: 156,
      colors: "White,Black,Rose Gold",
      moq: 30,
      categoryName: "Audio",
      categorySlug: "audio",
      brandName: "AudioTech",
      description: "True wireless earbuds with active noise cancellation. 30-hour total battery with case. Bluetooth 5.3. Touch controls. Premium sound quality.",
    },
    {
      id: 4,
      name: "LED Desk Lamp",
      slug: "led-desk-lamp",
      price: "2.80",
      compareAtPrice: "5.50",
      image: "/products/desk-lamp.jpg",
      rating: "4.1",
      reviewCount: 78,
      colors: "White,Black,Silver",
      moq: 25,
      categoryName: "Home & Office",
      categorySlug: "home-office",
      brandName: "LumiHome",
      description: "Adjustable LED desk lamp with 3 color temperatures and 5 brightness levels. USB charging port. Eye-care technology. Modern minimalist design.",
    },
    {
      id: 5,
      name: "Stainless Steel Water Bottle",
      slug: "stainless-steel-water-bottle",
      price: "1.50",
      compareAtPrice: "3.00",
      image: "/products/water-bottle.jpg",
      rating: "4.6",
      reviewCount: 312,
      colors: "Silver,Black,Blue,Green",
      moq: 20,
      categoryName: "Home & Office",
      categorySlug: "home-office",
      brandName: "HydroLife",
      description: "Double-wall vacuum insulated 500ml water bottle. Keeps drinks cold 24h, hot 12h. BPA-free. Leak-proof lid. Perfect for corporate gifting.",
    },
    {
      id: 6,
      name: "Wireless Phone Charger Pad",
      slug: "wireless-phone-charger-pad",
      price: "1.20",
      compareAtPrice: "2.50",
      image: "/products/charger-pad.jpg",
      rating: "4.0",
      reviewCount: 189,
      colors: "Black,White",
      moq: 40,
      categoryName: "Electronics",
      categorySlug: "electronics",
      brandName: "ChargeBase",
      description: "15W fast wireless charging pad. Compatible with iPhone and Android. LED indicator. Non-slip surface. Compact design for any desk or nightstand.",
    },
    {
      id: 7,
      name: "Noise Cancelling Headphones",
      slug: "noise-cancelling-headphones",
      price: "5.00",
      compareAtPrice: "12.00",
      image: "/products/headphones.jpg",
      rating: "4.7",
      reviewCount: 67,
      colors: "Black,Silver,Navy",
      moq: 15,
      categoryName: "Audio",
      categorySlug: "audio",
      brandName: "AudioTech",
      description: "Over-ear active noise cancelling headphones. 40-hour battery life. Hi-Res audio certified. Memory foam ear cushions. Foldable design with travel case.",
    },
    {
      id: 8,
      name: "Portable Phone Stand",
      slug: "portable-phone-stand",
      price: "0.60",
      compareAtPrice: "1.20",
      image: "/products/phone-stand.jpg",
      rating: "3.9",
      reviewCount: 445,
      colors: "Silver,Black,Rose Gold",
      moq: 60,
      categoryName: "Electronics",
      categorySlug: "electronics",
      brandName: "DeskMate",
      description: "Aluminum foldable phone and tablet stand. Adjustable angle. Non-slip base. Compatible with 4-12 inch devices. Pocket-sized when folded.",
    },
    {
      id: 9,
      name: "Bluetooth Mini Keyboard",
      slug: "bluetooth-mini-keyboard",
      price: "2.20",
      compareAtPrice: "4.50",
      image: "/products/keyboard.jpg",
      rating: "4.0",
      reviewCount: 98,
      colors: "White,Black,Pink",
      moq: 25,
      categoryName: "Electronics",
      categorySlug: "electronics",
      brandName: "TypePro",
      description: "Compact Bluetooth 5.0 keyboard with scissor-switch keys. Rechargeable battery lasts 60 days. Multi-device pairing. Perfect for tablets and phones.",
    },
    {
      id: 10,
      name: "Smart Watch Fitness Tracker",
      slug: "smart-watch-fitness-tracker",
      price: "4.00",
      compareAtPrice: "9.00",
      image: "/products/smartwatch.jpg",
      rating: "4.4",
      reviewCount: 203,
      colors: "Black,Blue,Pink",
      moq: 20,
      categoryName: "Electronics",
      categorySlug: "electronics",
      brandName: "FitTech",
      description: "Full-touch smartwatch with heart rate monitor, SpO2, sleep tracking. 7-day battery. IP68 waterproof. 100+ sport modes. Notification sync.",
    },
  ];

  const apiProducts = result?.items ?? [];
  const isStatic = apiProducts.length === 0;

  // Filter static products by category when in static mode
  let filteredStatic = staticProducts;
  if (isStatic && categorySlug) {
    filteredStatic = staticProducts.filter((p) => p.categorySlug === categorySlug);
  }
  if (isStatic && debouncedSearch) {
    const q = debouncedSearch.toLowerCase();
    filteredStatic = filteredStatic.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brandName?.toLowerCase().includes(q)
    );
  }
  // Apply sort to static products
  if (isStatic && sort) {
    filteredStatic = [...filteredStatic].sort((a, b) => {
      if (sort === "price_asc") return parseFloat(a.price) - parseFloat(b.price);
      if (sort === "price_desc") return parseFloat(b.price) - parseFloat(a.price);
      if (sort === "rating") return parseFloat(b.rating ?? "0") - parseFloat(a.rating ?? "0");
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }

  const products = isStatic ? filteredStatic : apiProducts;
  const pagination = isStatic ? null : result?.pagination;
  const { open: openQuickView } = useQuickView();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [categorySlug, subcategorySlug, debouncedSearch, sort]);

  const pageTitle = subcategorySlug ? (activeSub?.name ?? t("shop.title")) : categorySlug ? (activeParent?.name ?? t("shop.title")) : t("shop.title", "All Products");

  // Build page numbers
  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    if (total > 1) pages.push(total);
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${pageTitle} - BulkHub`} />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-12">
        <Breadcrumbs items={[
          { label: pageTitle },
        ]} />

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">{pageTitle}</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              {subcategorySlug ? activeSub?.name ?? t("shop.shop", "Shop") : categorySlug ? activeParent?.name ?? t("shop.shopAll", "Shop All") : t("shop.shopAll", "Shop All")}
            </h1>
            <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {products.length} products
              {pagination && pagination.totalPages > 1 && ` · Page ${pagination.page} of ${pagination.totalPages}`}
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-muted-foreground" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-card border border-input rounded-lg text-xs text-foreground px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.labelKey)}</option>)}
              </select>
            </div>
          </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("shop.searchPlaceholder", "Search products...")} className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="sm:hidden flex items-center gap-2 px-3 py-2 bg-card border border-input rounded-lg text-sm text-muted-foreground">
              <SlidersHorizontal size={14} /> {t("shop.filters", "Filters")}
            </button>
            <Link to="/shop" className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-colors ${!categorySlug && !subcategorySlug ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-input hover:border-primary"}`}>{t("shop.all", "All")}</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-colors ${categorySlug === cat.slug && !subcategorySlug ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-input hover:border-primary"}`}>{cat.name}</Link>
            ))}
          </div>
        </div>

        {/* Subcategory pills */}
        {activeParent?.subcategories && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-muted-foreground mr-1">{t("shop.subcategories", "Subcategories:")}</span>
            {activeParent.subcategories.map((sub) => (
              <Link key={sub.id} to={`/shop?subcategory=${sub.slug}`} className={`px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-colors ${subcategorySlug === sub.slug ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-input hover:border-primary"}`}>{sub.name}</Link>
            ))}
          </div>
        )}

        {/* Mobile filters */}
        {mobileFiltersOpen && (
          <div className="sm:hidden mb-4 flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
            <div className="flex flex-wrap gap-2">
              <Link to="/shop" onClick={() => setMobileFiltersOpen(false)} className={`px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-colors ${!categorySlug && !subcategorySlug ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-input"}`}>{t("shop.all", "All")}</Link>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} onClick={() => setMobileFiltersOpen(false)} className={`px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-colors ${categorySlug === cat.slug && !subcategorySlug ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-input"}`}>{cat.name}</Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse"><div className="aspect-square bg-secondary/50" /><div className="p-4 space-y-2"><div className="h-3 w-16 bg-secondary rounded" /><div className="h-4 w-full bg-secondary rounded" /><div className="h-4 w-20 bg-secondary rounded" /></div></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20"><p className="text-lg text-muted-foreground">{t("shop.noProducts", "No products found")}</p><button onClick={() => { setSearch(""); setPage(1); }} className="mt-4 text-sm text-primary hover:underline">{t("shop.clearFilters", "Clear filters")}</button></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={(p) => openQuickView(p)} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="w-9 h-9 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === p
                          ? "bg-primary text-primary-foreground"
                          : "border border-input text-muted-foreground hover:text-foreground hover:border-primary"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="w-9 h-9 rounded-lg border border-input flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
