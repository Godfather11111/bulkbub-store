import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ShoppingBag, Menu, X, User, ChevronDown, Globe, Package,
  Moon, Sun, Heart, GitCompare, Search, LayoutDashboard, LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/store/cart";
import { useThemeStore } from "@/store/theme";
import { useWishlist } from "@/store/wishlist";
import { useCompare } from "@/store/compare";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { languages } from "@/i18n";

interface CategoryWithSubs {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  createdAt: Date;
  subcategories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items, setIsOpen } = useCart();
  const { theme, toggle } = useThemeStore();
  const { items: wishlistItems } = useWishlist();
  const { items: compareItems } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: categoryData } = trpc.product.categories.useQuery();

  // Static categories fallback for deployment without backend
  const staticCategories: CategoryWithSubs[] = [
    {
      id: 1, name: "Electronics", slug: "electronics", description: "Consumer electronics and gadgets", image: null, parentId: null, createdAt: new Date(),
      subcategories: [
        { id: 11, name: "Phone Accessories", slug: "phone-accessories" },
        { id: 12, name: "Cables & Chargers", slug: "cables-chargers" },
        { id: 13, name: "Smart Devices", slug: "smart-devices" },
        { id: 14, name: "Computer Peripherals", slug: "computer-peripherals" },
      ],
    },
    {
      id: 2, name: "Audio", slug: "audio", description: "Headphones, speakers, and audio equipment", image: null, parentId: null, createdAt: new Date(),
      subcategories: [
        { id: 21, name: "Headphones", slug: "headphones" },
        { id: 22, name: "Speakers", slug: "speakers" },
        { id: 23, name: "Earbuds", slug: "earbuds" },
        { id: 24, name: "Audio Cables", slug: "audio-cables" },
      ],
    },
    {
      id: 3, name: "Home & Office", slug: "home-office", description: "Office supplies and home essentials", image: null, parentId: null, createdAt: new Date(),
      subcategories: [
        { id: 31, name: "Desk Accessories", slug: "desk-accessories" },
        { id: 32, name: "Lighting", slug: "lighting" },
        { id: 33, name: "Storage", slug: "storage" },
        { id: 34, name: "Drinkware", slug: "drinkware" },
      ],
    },
    {
      id: 4, name: "Lighting", slug: "lighting-cat", description: "LED lights and lighting solutions", image: null, parentId: null, createdAt: new Date(),
      subcategories: [
        { id: 41, name: "LED Lights", slug: "led-lights" },
        { id: 42, name: "Desk Lamps", slug: "desk-lamps" },
        { id: 43, name: "Strip Lights", slug: "strip-lights" },
      ],
    },
    {
      id: 5, name: "Accessories", slug: "accessories", description: "Bags, cases, and everyday accessories", image: null, parentId: null, createdAt: new Date(),
      subcategories: [
        { id: 51, name: "Phone Cases", slug: "phone-cases" },
        { id: 52, name: "Bags & Sleeves", slug: "bags-sleeves" },
        { id: 53, name: "Stands & Holders", slug: "stands-holders" },
      ],
    },
  ];

  const apiCategories = (categoryData ?? []) as unknown as CategoryWithSubs[];
  const categories = apiCategories.length > 0 ? apiCategories : staticCategories;

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  // Cart badge bounce animation
  useEffect(() => {
    if (totalItems > 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Close language and user dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMouseEnter = (slug: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(slug);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 250);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-[11px] tracking-[0.15em] uppercase font-medium">
        {t("nav.shipping", "Free shipping on all orders over $75")}
      </div>

      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-sm border-border"
            : "bg-background border-transparent"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="text-xl lg:text-2xl font-bold tracking-[0.2em] text-foreground hover:text-primary transition-colors"
            >
              BULKHUB
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              <Link
                to="/"
                className={`px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors rounded-md ${
                  location.pathname === "/"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                to="/blog"
                className={`px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors rounded-md ${
                  location.pathname === "/blog"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Blog
              </Link>

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(cat.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className={`flex items-center gap-1 px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors rounded-md ${
                      location.search.includes(cat.slug)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        openDropdown === cat.slug ? "rotate-180" : ""
                      }`}
                    />
                  </Link>

                  {openDropdown === cat.slug && (
                    <div className="absolute top-full left-0 w-52 pt-2 z-50" onMouseEnter={() => handleMouseEnter(cat.slug)} onMouseLeave={handleMouseLeave}>
                    <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                      <div className="py-2">
                        <Link
                          to={`/shop?category=${cat.slug}`}
                          className="block px-4 py-2 text-xs tracking-wider uppercase text-primary font-medium hover:bg-accent transition-colors"
                        >
                          All {cat.name}
                        </Link>
                        <div className="mx-3 my-1 border-t border-border" />
                        {cat.subcategories?.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/shop?subcategory=${sub.slug}`}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <button
                onClick={toggle}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title={theme === "light" ? "Switch to dark" : "Switch to light"}
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Language Switcher */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  title="Change language"
                  aria-label="Change language"
                >
                  <Globe size={18} />
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-accent ${
                          i18n.language === lang.code ? "text-primary font-medium bg-accent/50" : "text-foreground"
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>{lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/compare"
                className="hidden sm:flex relative min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitCompare size={18} />
                {compareItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {compareItems.length}
                  </span>
                )}
              </Link>

              <Link
                to="/wishlist"
                className="hidden sm:flex relative min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div ref={userMenuRef} className="hidden lg:flex items-center gap-3 ml-2 relative">
                  <Link to="/orders" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Package size={14} /> Orders
                  </Link>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] px-2 rounded-lg hover:bg-accent"
                  >
                    <User size={16} />
                    <span className="max-w-[80px] truncate">{user?.name}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                      <div className="py-2">
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                          <Package size={14} /> My Orders
                        </Link>
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors">
                          <LayoutDashboard size={14} /> Admin
                        </Link>
                        <div className="mx-3 my-1 border-t border-border" />
                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:block text-xs tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors ml-2"
                >
                  LOGIN
                </Link>
              )}

              <button
                onClick={() => setIsOpen(true)}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-1"
                aria-label="Open cart"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center ${cartBounce ? "cart-badge-bounce" : ""}`}>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border bg-card px-4 py-3 animate-fade-in-up">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="flex-1 px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24">
          <div className="flex flex-col items-center gap-6 pt-6 px-6 overflow-y-auto h-full pb-20">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-xl tracking-[0.2em] text-foreground hover:text-primary transition-colors">HOME</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)} className="text-xl tracking-[0.2em] text-foreground hover:text-primary transition-colors">BLOG</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-xl tracking-[0.2em] text-primary transition-colors">SHOP ALL</Link>
            {isAuthenticated && (
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-xl tracking-[0.2em] text-foreground hover:text-primary transition-colors">MY ORDERS</Link>
            )}
            <div className="w-full border-t border-border pt-6" />
            {categories.map((cat) => (
              <div key={cat.id} className="w-full">
                <Link to={`/shop?category=${cat.slug}`} onClick={() => setMobileOpen(false)} className="text-lg tracking-[0.15em] text-primary font-medium">{cat.name}</Link>
                <div className="mt-2 ml-4 flex flex-col gap-2">
                  {cat.subcategories?.map((sub) => (
                    <Link key={sub.id} to={`/shop?subcategory=${sub.slug}`} onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{sub.name}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
