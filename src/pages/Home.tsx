import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShoppingBag, Truck, Shield, HeadphonesIcon, Star, ChevronRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useQuickView } from "@/store/quickView";
import ProductCard from "@/components/ProductCard";
import BrandMarquee from "@/components/BrandMarquee";
import CountdownTimer from "@/components/CountdownTimer";
import SEO from "@/components/SEO";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("electronics");
  const [heroSlide, setHeroSlide] = useState(0);
  const { data: allProductsResult } = trpc.product.list.useQuery({});
  const { data: categoryData } = trpc.product.categories.useQuery();
  const { data: blogPosts } = trpc.product.blogPosts.useQuery({ limit: 3 });
  const { data: featuredResult } = trpc.product.list.useQuery({ featured: true });

  const allProducts = allProductsResult?.items;
  const featuredProducts = featuredResult?.items;
  const { open: openQuickView } = useQuickView();

  const categories = categoryData ?? [];

  const heroSlides = [
    {
      tag: t("hero.tag", "New Collection"),
      title: t("hero.slide1Title", "Premium Headphones"),
      subtitle: t("hero.slide1Subtitle", "Experience crystal clear audio with our noise-cancelling technology. Up to 30 hours of battery life."),
      cta: t("hero.cta", "Shop Now"),
      image: "/products/headphones.jpg",
      color: "from-orange-500/10 to-transparent",
    },
    {
      tag: t("hero.tag2", "Best Seller"),
      title: t("hero.slide2Title", "Smart Watch Pro"),
      subtitle: t("hero.slide2Subtitle", "Track your fitness, monitor your health, and stay connected with style."),
      cta: t("hero.cta2", "Explore"),
      image: "/products/smartwatch.jpg",
      color: "from-blue-500/10 to-transparent",
    },
    {
      tag: t("hero.tag3", "Limited Offer"),
      title: t("hero.slide3Title", "Leather Backpack"),
      subtitle: t("hero.slide3Subtitle", "Handcrafted from full-grain Italian leather. Fits up to 15-inch laptop."),
      cta: t("hero.cta3", "Shop Bags"),
      image: "/products/backpack.jpg",
      color: "from-amber-500/10 to-transparent",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // GSAP scroll animations - run once on mount
  useEffect(() => {
    if (!allProducts?.length) return;
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".home-section").forEach((section) => {
          gsap.fromTo(section,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" },
            }
          );
        });
      });
      return () => ctx.revert();
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter products by active tab
  const tabProducts = allProducts?.filter((p: any) => {
    const catSlug = p.categorySlug || "";
    if (activeTab === "electronics") return catSlug.includes("audio") || catSlug.includes("smart") || catSlug.includes("camera") || catSlug.includes("tech");
    if (activeTab === "fashion") return catSlug.includes("bag") || catSlug.includes("eye") || catSlug.includes("head") || catSlug.includes("apparel");
    if (activeTab === "home") return catSlug.includes("light") || catSlug.includes("decor") || catSlug.includes("frag") || catSlug.includes("textile");
    if (activeTab === "sports") return catSlug.includes("fitness") || catSlug.includes("outdoor") || catSlug.includes("hydrat") || catSlug.includes("recover");
    if (activeTab === "beauty") return catSlug.includes("skin") || catSlug.includes("body") || catSlug.includes("hair") || catSlug.includes("beauty-tool");
    return true;
  }).slice(0, 8);

  // Hot deals products (products with compareAtPrice)
  const deals = allProducts?.filter((p: any) => p.compareAtPrice).slice(0, 2) ?? [];

  const tabs = [
    { key: "electronics", label: t("tabs.electronics", "Electronics") },
    { key: "fashion", label: t("tabs.fashion", "Fashion") },
    { key: "home", label: t("tabs.home", "Home") },
    { key: "sports", label: t("tabs.sports", "Sports") },
    { key: "beauty", label: t("tabs.beauty", "Beauty") },
  ];

  const benefits = [
    { icon: Truck, title: t("benefits.shipping", "Free Shipping"), desc: t("benefits.shippingDesc", "Orders over $75") },
    { icon: Shield, title: t("benefits.secure", "Secure Payment"), desc: t("benefits.secureDesc", "256-bit SSL") },
    { icon: ShoppingBag, title: t("benefits.returns", "Easy Returns"), desc: t("benefits.returnsDesc", "30-day policy") },
    { icon: HeadphonesIcon, title: t("benefits.support", "24/7 Support"), desc: t("benefits.supportDesc", "Always here") },
  ];

  return (
    <div className="bg-background">
      <SEO title={t("seo.homeTitle", "BulkHub - Wholesale Products for Your Business")} description={t("seo.homeDesc", "Buy quality products in bulk at wholesale prices. MOQ 100+, secure payments, fast shipping.")} />
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left: Category Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-primary/5 border-b border-border">
                <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-primary">{t("categories.title", "Categories")}</h3>
              </div>
              <div className="py-2">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="group">
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:text-primary hover:bg-accent transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary" />
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{cat.subcategories?.length ?? 0}</span>
                    </Link>
                    <div className="hidden group-hover:block bg-accent/30">
                      {cat.subcategories?.map((sub: any) => (
                        <Link key={sub.id} to={`/shop?subcategory=${sub.slug}`} className="block pl-10 pr-4 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">{sub.name}</Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Hero Slider */}
          <div className="lg:col-span-6">
            <div className="relative h-[360px] lg:h-[420px] rounded-xl overflow-hidden bg-card border border-border">
              {heroSlides.map((slide, idx) => (
                <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === heroSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.color}`} />
                  <div className="absolute inset-0 flex flex-col sm:flex-row items-center">
                    <div className="w-full sm:w-1/2 px-6 sm:pl-8 lg:pl-12 z-10 pt-6 sm:pt-0">
                      <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase rounded-md mb-3">{slide.tag}</span>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">{slide.title}</h2>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-[280px]">{slide.subtitle}</p>
                      <Link to="/shop" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">{slide.cta}<ArrowRight size={14} /></Link>
                    </div>
                    <div className="w-full sm:w-1/2 h-[50%] sm:h-full flex items-center justify-center p-4 sm:p-6">
                      <img src={slide.image} alt={slide.title} className="max-w-full max-h-[200px] sm:max-h-[280px] object-contain drop-shadow-xl" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroSlides.map((_, idx) => (
                  <button key={idx} onClick={() => setHeroSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === heroSlide ? "w-6 bg-primary" : "bg-border hover:bg-muted-foreground"}`} />
                ))}
              </div>
            </div>

            {/* Benefits Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><b.icon size={16} className="text-primary" /></div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{b.title}</p>
                    <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Hot Deals */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-primary mb-3 flex items-center gap-2"><Star size={14} fill="currentColor" />{t("deals.title", "Hot Deals")}</h3>
              {deals.length > 0 ? deals.map((deal: any) => (
                <div key={deal.id} className="mb-4 last:mb-0">
                  <Link to={`/shop/${deal.slug}`} className="flex gap-3 group">
                    <img src={deal.image || "/placeholder.png"} alt={deal.name} className="w-16 h-16 object-cover rounded-lg bg-secondary/50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{deal.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-primary">${Number(deal.price).toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground line-through">${Number(deal.compareAtPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )) : <p className="text-xs text-muted-foreground">{t("common.loading", "Loading...")}</p>}
            </div>
            <div className="bg-gradient-to-br from-primary/90 to-primary rounded-xl p-5 text-primary-foreground flex-1 flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium opacity-80">{t("deals.limited", "Limited Time Offer")}</p>
              <h3 className="text-lg font-bold mt-1">{t("deals.summer", "Summer Sale")}</h3>
              <p className="text-xs opacity-80 mt-1">{t("deals.off", "Up to 40% off selected items")}</p>
              <div className="mt-4"><CountdownTimer targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()} /></div>
              <Link to="/shop" className="mt-4 inline-block text-center py-2 bg-primary-foreground text-primary rounded-lg text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-opacity">{t("hero.cta", "Shop Now")}</Link>
            </div>
          </div>
        </div>
      </section>

      <BrandMarquee />

      {/* Bestsellers - Tabbed */}
      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 lg:py-16 home-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">{t("bestsellers.label", "Bestsellers")}</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{t("bestsellers.title", "Popular Products")}</h2>
          </div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-1.5 rounded-md text-xs tracking-wider uppercase transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>{tab.label}</button>
            ))}
          </div>
        </div>
        {tabProducts && tabProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tabProducts.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={(p) => openQuickView(p)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse"><div className="aspect-square bg-secondary/50" /><div className="p-4 space-y-2"><div className="h-3 w-16 bg-secondary rounded" /><div className="h-4 w-full bg-secondary rounded" /><div className="h-4 w-20 bg-secondary rounded" /></div></div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 lg:py-16 bg-card/30 border-y border-border home-section">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">{t("featured.label", "Featured")}</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{t("featured.title", "Editor's Picks")}</h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-1 text-sm text-primary hover:underline">{t("featured.viewAll", "View All")}<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={(p) => openQuickView(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Category Cards */}
      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 lg:py-16 home-section">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">{t("categories.explore", "Explore")}</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{t("categories.shopBy", "Shop by Category")}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat: any) => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group relative h-44 rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 bg-card">
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent z-10" />
              <div className="absolute inset-0 bg-secondary/30 group-hover:bg-secondary/50 transition-colors" />
              <div className="relative z-20 flex flex-col items-center justify-center h-full p-4 text-center">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="mt-1 text-[10px] text-muted-foreground">{cat.subcategories?.length ?? 0} {t("categories.sub", "subcategories")}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">{t("categories.exploreBtn", "Explore")}<ArrowRight size={12} /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Blog Section */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 lg:py-16 bg-card/30 border-y border-border home-section">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">{t("blog.fromBlog", "From the Blog")}</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{t("blog.latest", "Latest Articles")}</h2>
            </div>
            <Link to="/blog" className="group flex items-center gap-1 text-sm text-primary hover:underline">{t("blog.viewAll", "View All")}<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post: any) => (
              <article key={post.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300">
                <div className="h-48 bg-secondary/50 flex items-center justify-center"><span className="text-4xl font-bold text-muted-foreground/20">{post.category?.slice(0, 2)}</span></div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-primary font-medium tracking-wider uppercase">{post.category}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <Link to="/blog" className="mt-3 text-xs text-primary flex items-center gap-1">{t("blog.readMore", "Read More")}<ArrowRight size={12} /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
