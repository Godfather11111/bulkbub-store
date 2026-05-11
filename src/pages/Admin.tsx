import { useState, useRef } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Package, ShoppingCart, FileText, TrendingUp,
  ArrowUpRight, ArrowDownRight, Search, Plus, Trash2, Pencil,
  X, ChevronLeft, ChevronRight, LogOut, Lock, Upload, ImageIcon,
  Download, CheckSquare, Square, Settings, BarChart3, KeyRound
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { trpc } from "@/providers/trpc";
import { useAdminAuth } from "@/store/adminAuth";
import SEO from "@/components/SEO";

type Tab = "overview" | "products" | "orders" | "quotes" | "settings";

const COLORS = ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];

// ─── Admin Login Gate ───────────────────────────────────────────
function AdminLogin() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (!ok) setError(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEO title="Admin Login - BulkHub" />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Lock size={32} className="mx-auto text-primary mb-3" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">{t("admin.title")}</h1>
          <p className="text-xs text-muted-foreground mt-1">{t("admin.login")}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          {error && <p className="text-xs text-red-500 text-center">Invalid password. Please try again.</p>}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">{t("admin.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            {t("admin.login")}
          </button>
        </form>
        <p className="text-center mt-4 text-xs text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">{t("admin.backToStore")}</Link>
        </p>
      </div>
    </div>
  );
}

// ─── CSV Import Helper ──────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let inQuotes = false, val = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { values.push(val.trim()); val = ""; }
      else { val += ch; }
    }
    values.push(val.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => row[h] = (values[i] || "").replace(/^"|"$/g, ""));
    return row;
  });
}

function parseExcel(arrayBuffer: ArrayBuffer): Record<string, string>[] {
  try {
    const w = window as unknown as Record<string, unknown>;
    const XLSX = w.XLSX as any;
    if (!XLSX) return [];
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    if (json.length < 2) return [];
    const headers = json[0].map(h => String(h).trim());
    return json.slice(1).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => obj[h] = String(row[i] || ""));
      return obj;
    });
  } catch {
    return [];
  }
}

// ─── Main Admin Dashboard ───────────────────────────────────────
export default function Admin() {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <AdminLogin />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const { t } = useTranslation();
  const { logout } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState<Record<string, string>[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  // Password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Add product form
  const [newProduct, setNewProduct] = useState({
    name: "", slug: "", description: "", price: "", compareAtPrice: "",
    image: "", inventory: "100", moq: "100", tags: "", colors: ""
  });

  // Upload state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: productsData } = trpc.admin.products.useQuery({ search: productSearch || undefined, page: productPage, limit: 20 });
  const { data: ordersData } = trpc.admin.orders.useQuery({ page: orderPage, limit: 20 });
  const { data: quotesData } = trpc.admin.quotes.useQuery();
  const { data: orderDetail } = trpc.admin.orderDetail.useQuery({ id: selectedOrder! }, { enabled: !!selectedOrder });
  const { data: recentSales } = trpc.admin.recentSales.useQuery();
  const { data: salesByMonth } = trpc.admin.salesByMonth.useQuery();

  const utils = trpc.useUtils();

  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => { utils.admin.products.invalidate(); setShowAddProduct(false); resetForm(); },
  });

  const updateProductMut = trpc.admin.updateProduct.useMutation({
    onSuccess: () => { utils.admin.products.invalidate(); setEditingProduct(null); },
  });

  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => { utils.admin.products.invalidate(); setSelectedProducts(new Set()); },
  });

  const bulkDeleteProducts = trpc.admin.bulkDeleteProducts.useMutation({
    onSuccess: () => { utils.admin.products.invalidate(); setSelectedProducts(new Set()); },
  });

  const updateOrderStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => { utils.admin.orders.invalidate(); utils.admin.stats.invalidate(); },
  });

  const updateQuoteStatus = trpc.admin.updateQuoteStatus.useMutation({
    onSuccess: () => utils.admin.quotes.invalidate(),
  });

  const { setPassword } = useAdminAuth();

  const resetForm = () => setNewProduct({ name: "", slug: "", description: "", price: "", compareAtPrice: "", image: "", inventory: "100", moq: "100", tags: "", colors: "" });

  const handleCreate = () => {
    if (!newProduct.name || !newProduct.slug || !newProduct.price) return;
    createProduct.mutate({
      name: newProduct.name, slug: newProduct.slug,
      description: newProduct.description || undefined,
      price: newProduct.price,
      compareAtPrice: newProduct.compareAtPrice || undefined,
      image: newProduct.image || undefined,
      inventory: Number(newProduct.inventory) || 100,
      moq: Number(newProduct.moq) || 100,
      tags: newProduct.tags || undefined,
      colors: newProduct.colors || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingProduct) return;
    updateProductMut.mutate({
      id: editingProduct.id,
      name: editingProduct.name || undefined,
      slug: editingProduct.slug || undefined,
      description: editingProduct.description || undefined,
      price: String(editingProduct.price) || undefined,
      compareAtPrice: editingProduct.compareAtPrice ? String(editingProduct.compareAtPrice) : undefined,
      image: editingProduct.image || undefined,
      inventory: Number(editingProduct.inventory) || undefined,
      moq: Number(editingProduct.moq) || undefined,
      colors: editingProduct.colors || undefined,
      tags: editingProduct.tags || undefined,
    });
  };

  // Image upload handler
  const handleFileUpload = async (file: File, isEdit = false) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, image: data.url });
        } else {
          setNewProduct({ ...newProduct, image: data.url });
        }
      }
    } catch { /* upload failed silently */ }
    setUploading(false);
  };

  // CSV/Excel import handler
  const handleImportFile = async (file: File) => {
    setImportFileName(file.name);
    const text = await file.text();
    let data: Record<string, string>[] = [];
    if (file.name.endsWith(".csv")) {
      data = parseCSV(text);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const buf = await file.arrayBuffer();
      data = parseExcel(buf);
    }
    setImportData(data);
  };

  const handleImportProducts = () => {
    if (!importData.length) return;
    // Map CSV columns to product fields
    const productsToCreate = importData.map(row => {
      const name = row.name || row.Name || row.product || row.Product || "";
      const slug = row.slug || row.Slug || name.toLowerCase().replace(/\s+/g, "-") || "";
      return {
        name,
        slug,
        description: row.description || row.Description || "",
        price: String(row.price || row.Price || "0"),
        compareAtPrice: row.compareAtPrice || row["Compare At Price"] || row.compare_at_price || undefined,
        image: row.image || row.Image || row.imageUrl || "",
        inventory: Number(row.inventory || row.Inventory || row.stock || row.Stock || 100),
        moq: Number(row.moq || row.MOQ || row.min_order || 100),
        colors: row.colors || row.Colors || "",
        tags: row.tags || row.Tags || row.category || row.Category || "",
      };
    }).filter(p => p.name && p.slug);

    // Create products one by one
    productsToCreate.forEach(p => createProduct.mutate(p));
    setShowImport(false);
    setImportData([]);
    setImportFileName("");
  };

  // Bulk selection handlers
  const toggleSelect = (id: number) => {
    const next = new Set(selectedProducts);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedProducts(next);
  };

  const toggleSelectAll = () => {
    if (!productsData?.items) return;
    if (selectedProducts.size === productsData.items.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(productsData.items.map((p: any) => p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    if (confirm(`Delete ${selectedProducts.size} selected products?`)) {
      bulkDeleteProducts.mutate({ ids: Array.from(selectedProducts) });
    }
  };

  // Password change handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    const ok = setPassword(oldPassword, newPassword);
    if (ok) {
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
    } else {
      setPasswordError("Current password is incorrect");
    }
  };

  const tabs = [
    { key: "overview" as Tab, label: t("admin.overview"), icon: LayoutDashboard },
    { key: "products" as Tab, label: t("admin.products"), icon: Package },
    { key: "orders" as Tab, label: t("admin.orders"), icon: ShoppingCart },
    { key: "quotes" as Tab, label: t("admin.quotes"), icon: FileText },
    { key: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const pieData = stats ? [
    { name: "Products", value: stats.totalProducts },
    { name: "Orders", value: stats.totalOrders },
    { name: "Pending Quotes", value: stats.pendingQuotes },
  ].filter(d => d.value > 0) : [];

  // ─── Upload drop zone component ──────────────────────────────
  const UploadZone = ({ image, isEdit = false }: { image: string; onImageChange: (url: string) => void; isEdit?: boolean }) => (
    <div
      className="border-2 border-dashed border-input rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
      onClick={() => isEdit ? editFileInputRef.current?.click() : fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f, isEdit); }}
    >
      <input
        ref={isEdit ? editFileInputRef : fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, isEdit); }}
      />
      {image ? (
        <img src={image} alt="Preview" className="w-full h-32 object-contain rounded" />
      ) : (
        <div className="py-4">
          <Upload size={20} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Click or drag image here</p>
        </div>
      )}
      {uploading && <p className="text-[10px] text-primary mt-2">Uploading...</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin Dashboard - BulkHub" />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 min-h-screen bg-card border-r border-border fixed left-0 top-0 z-40 hidden lg:flex flex-col">
          <div className="p-5 border-b border-border">
            <Link to="/" className="text-lg font-bold tracking-[0.15em] text-foreground">BULKHUB</Link>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("admin.title")}</p>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setSelectedOrder(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${tab === t.key ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <LogOut size={16} /> {t("admin.logout")}
            </button>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border">
          <div className="flex overflow-x-auto px-4 py-2 gap-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${tab === t.key ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground border border-input"}`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
            <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-500 border border-red-200 whitespace-nowrap"><LogOut size={14} /> {t("admin.logout")}</button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* OVERVIEW */}
            {tab === "overview" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold text-foreground">{t("admin.overview")}</h1>
                  <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: t("admin.totalProducts"), value: stats?.totalProducts ?? 0, icon: Package, trend: "up" },
                    { label: t("admin.totalOrders"), value: stats?.totalOrders ?? 0, icon: ShoppingCart, trend: "up" },
                    { label: t("admin.pendingQuotes"), value: stats?.pendingQuotes ?? 0, icon: FileText, trend: "neutral" },
                    { label: t("admin.revenue"), value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: TrendingUp, trend: "up" },
                  ].map((s) => (
                    <div key={s.label} className="p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center justify-between mb-2"><s.icon size={16} className="text-primary" /><span className="text-[10px] text-muted-foreground">{s.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}</span></div>
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 size={14} className="text-primary" /> {t("admin.salesByMonth")}
                    </h3>
                    {salesByMonth && salesByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={salesByMonth}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1e40af" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                            labelStyle={{ color: "var(--foreground)" }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#1e40af" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-8">No sales data yet</p>
                    )}
                  </div>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Distribution</h3>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">{t("admin.recentOrders")}</h3>
                    {recentSales && recentSales.length > 0 ? (
                      <div className="space-y-3">
                        {recentSales.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div><p className="text-xs font-medium text-foreground">Order #{s.id.toString().padStart(5, "0")}</p><p className="text-[10px] text-muted-foreground">{s.customerName || s.customerEmail || "Guest"}</p></div>
                            <div className="text-right"><p className="text-xs font-medium text-primary">${Number(s.total).toFixed(2)}</p><span className={`text-[9px] px-1.5 py-0.5 rounded ${statusColors[s.status] || ""}`}>{s.status}</span></div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground">No orders yet</p>}
                  </div>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Sales Performance</h3>
                    {salesByMonth && salesByMonth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={salesByMonth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-xs text-muted-foreground text-center py-8">No sales data yet</p>}
                  </div>
                </div>
              </>
            )}

            {/* PRODUCTS */}
            {tab === "products" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-bold text-foreground">{t("admin.products")}</h1>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 border border-input text-foreground rounded-lg text-xs font-medium hover:bg-accent transition-colors">
                      <Download size={14} /> {t("admin.import")}
                    </button>
                    <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
                      <Plus size={14} /> {t("admin.addProduct")}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }} placeholder={t("admin.search")} className="w-full pl-8 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  {selectedProducts.size > 0 && (
                    <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                      <Trash2 size={14} /> {t("admin.bulkDelete")} ({selectedProducts.size})
                    </button>
                  )}
                </div>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="text-left px-3 py-3">
                            <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                              {selectedProducts.size === (productsData?.items?.length || 0) && (productsData?.items?.length ?? 0) > 0 ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                            </button>
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Product</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Price</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">MOQ</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Stock</th>
                          <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsData?.items.map((p: any) => (
                          <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                            <td className="px-3 py-3">
                              <button onClick={() => toggleSelect(p.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                                {selectedProducts.has(p.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {p.image ? <img src={p.image} alt="" className="w-8 h-8 object-cover rounded" /> : <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center"><ImageIcon size={12} className="text-muted-foreground" /></div>}
                                <div><p className="font-medium text-foreground">{p.name}</p><p className="text-[10px] text-muted-foreground">{p.slug}</p></div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-primary font-medium">${Number(p.price).toFixed(2)}</td>
                            <td className="px-4 py-3 text-foreground">{p.moq}</td>
                            <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded ${p.inventory < 50 ? "bg-red-100 text-red-700 dark:bg-red-900/30" : "bg-green-100 text-green-700 dark:bg-green-900/30"}`}>{p.inventory}</span></td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setEditingProduct(p)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                                <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate({ id: p.id }); }} className="p-1 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {productsData?.pagination && productsData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage <= 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronLeft size={16} /></button>
                      <span className="text-xs text-muted-foreground">Page {productPage} of {productsData.pagination.totalPages}</span>
                      <button onClick={() => setProductPage(p => p + 1)} disabled={productPage >= productsData.pagination.totalPages} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ORDERS */}
            {tab === "orders" && (
              <>
                <h1 className="text-xl font-bold text-foreground mb-6">{t("admin.orders")}</h1>
                {selectedOrder && orderDetail ? (
                  <div className="mb-6">
                    <button onClick={() => setSelectedOrder(null)} className="text-xs text-primary hover:underline mb-4">&larr; Back to orders</button>
                    <div className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div><h2 className="text-lg font-bold text-foreground">Order #{selectedOrder.toString().padStart(6, "0")}</h2><p className="text-xs text-muted-foreground mt-0.5">{new Date(orderDetail.createdAt).toLocaleString()}</p></div>
                        <span className={`text-xs px-3 py-1 rounded-md font-medium ${statusColors[orderDetail.status]}`}>{orderDetail.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div><p className="text-xs text-muted-foreground">Customer</p><p className="text-foreground">{orderDetail.customerName || "Guest"}</p></div>
                        <div><p className="text-xs text-muted-foreground">Email</p><p className="text-foreground">{orderDetail.customerEmail || "N/A"}</p></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-primary font-medium">${Number(orderDetail.total).toFixed(2)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Payment</p><p className="text-foreground">{orderDetail.paymentStatus}</p></div>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">Items</h3>
                      <div className="space-y-2">
                        {orderDetail.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-background border border-input rounded-lg">
                            <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1"><p className="text-xs font-medium text-foreground">{item.productName}</p><p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p></div>
                            <p className="text-xs font-medium text-primary">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50 border-b border-border"><tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Order</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Total</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                      </tr></thead>
                      <tbody>
                        {ordersData?.items.map((o: any) => (
                          <tr key={o.id} onClick={() => setSelectedOrder(o.id)} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer">
                            <td className="px-4 py-3 font-medium text-foreground">#{o.id.toString().padStart(6, "0")}</td>
                            <td className="px-4 py-3 text-muted-foreground">{o.customerName || o.customerEmail || "Guest"}</td>
                            <td className="px-4 py-3 text-primary font-medium">${Number(o.total).toFixed(2)}</td>
                            <td className="px-4 py-3"><select value={o.status} onChange={(e) => { e.stopPropagation(); updateOrderStatus.mutate({ id: o.id, status: e.target.value as "pending" | "processing" | "completed" | "cancelled" }); }} className={`text-[10px] px-2 py-1 rounded ${statusColors[o.status] || ""} bg-transparent border-0 cursor-pointer`}><option value="pending">Pending</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {ordersData?.pagination && ordersData.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage <= 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronLeft size={16} /></button>
                        <span className="text-xs text-muted-foreground">Page {orderPage} of {ordersData.pagination.totalPages}</span>
                        <button onClick={() => setOrderPage(p => p + 1)} disabled={orderPage >= ordersData.pagination.totalPages} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronRight size={16} /></button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* QUOTES */}
            {tab === "quotes" && (
              <>
                <h1 className="text-xl font-bold text-foreground mb-6">{t("admin.quotes")}</h1>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 border-b border-border"><tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Qty</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                    </tr></thead>
                    <tbody>
                      {quotesData?.map((q: any) => (
                        <tr key={q.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-3"><p className="font-medium text-foreground text-xs">{q.name}</p><p className="text-[10px] text-muted-foreground">{q.email}</p></td>
                          <td className="px-4 py-3 text-xs text-foreground">{q.productName || "General"}</td>
                          <td className="px-4 py-3 text-xs text-foreground">{q.quantity}</td>
                          <td className="px-4 py-3"><select value={q.status} onChange={(e) => updateQuoteStatus.mutate({ id: q.id, status: e.target.value as "pending" | "reviewed" | "responded" })} className={`text-[10px] px-2 py-1 rounded ${statusColors[q.status] || ""} bg-transparent border-0 cursor-pointer`}><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="responded">Responded</option></select></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* SETTINGS */}
            {tab === "settings" && (
              <>
                <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>
                <div className="max-w-lg space-y-6">
                  {/* Password Change */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <KeyRound size={18} className="text-primary" />
                      <h2 className="text-sm font-semibold text-foreground">{t("admin.changePassword")}</h2>
                    </div>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      {passwordSuccess && <p className="text-xs text-green-500">Password changed successfully!</p>}
                      {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Current Password</label>
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" required minLength={6} />
                      </div>
                      <button type="submit" className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                        {t("admin.changePassword")}
                      </button>
                    </form>
                  </div>

                  {/* Export Template */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Download size={18} className="text-primary" />
                      <h2 className="text-sm font-semibold text-foreground">Import Template</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Download a CSV template to bulk import products. Required columns: name, slug, price. Optional: description, compareAtPrice, image, inventory, moq, colors, tags.
                    </p>
                    <button
                      onClick={() => {
                        const template = "name,slug,price,compareAtPrice,description,image,inventory,moq,colors,tags\nExample Product,example-product,49.99,69.99,A great product,https://bulkhub.store/images/example.jpg,500,100,Red|Blue|Black,electronics";
                        const blob = new Blob([template], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url; a.download = "bulkhub-import-template.csv"; a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-input text-foreground rounded-lg text-xs font-medium hover:bg-accent transition-colors"
                    >
                      <Download size={14} /> Download Template
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── ADD PRODUCT MODAL ─────────────────────────────────── */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddProduct(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t("admin.addProduct")}</h2>
              <button onClick={() => setShowAddProduct(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <UploadZone image={newProduct.image} onImageChange={(url) => setNewProduct({ ...newProduct, image: url })} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">Name *</label><input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="Product name" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Slug *</label><input value={newProduct.slug} onChange={e => setNewProduct({ ...newProduct, slug: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="product-slug" /></div>
              </div>
              <div><label className="block text-xs font-medium text-foreground mb-1">Description</label><textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">Price *</label><input value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="49.99" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Compare At</label><input value={newProduct.compareAtPrice} onChange={e => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="69.99" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">MOQ</label><input value={newProduct.moq} onChange={e => setNewProduct({ ...newProduct, moq: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Inventory</label><input value={newProduct.inventory} onChange={e => setNewProduct({ ...newProduct, inventory: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">Colors</label><input value={newProduct.colors} onChange={e => setNewProduct({ ...newProduct, colors: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="Black,White,Blue" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Tags</label><input value={newProduct.tags} onChange={e => setNewProduct({ ...newProduct, tags: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="electronics,audio" /></div>
              </div>
              <button onClick={handleCreate} disabled={createProduct.isPending} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{createProduct.isPending ? "Creating..." : t("admin.addProduct")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT PRODUCT MODAL ─────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingProduct(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t("admin.editProduct")}</h2>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <UploadZone image={editingProduct.image} onImageChange={(url) => setEditingProduct({ ...editingProduct, image: url })} isEdit />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">Name</label><input value={editingProduct.name || ""} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Slug</label><input value={editingProduct.slug || ""} onChange={e => setEditingProduct({ ...editingProduct, slug: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium text-foreground mb-1">Description</label><textarea value={editingProduct.description || ""} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">Price</label><input value={editingProduct.price || ""} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Compare At</label><input value={editingProduct.compareAtPrice || ""} onChange={e => setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">MOQ</label><input value={editingProduct.moq || 100} onChange={e => setEditingProduct({ ...editingProduct, moq: Number(e.target.value) })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Inventory</label><input value={editingProduct.inventory || 0} onChange={e => setEditingProduct({ ...editingProduct, inventory: Number(e.target.value) })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-foreground mb-1">Colors</label><input value={editingProduct.colors || ""} onChange={e => setEditingProduct({ ...editingProduct, colors: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="Black,White,Blue" /></div>
                <div><label className="block text-xs font-medium text-foreground mb-1">Tags</label><input value={editingProduct.tags || ""} onChange={e => setEditingProduct({ ...editingProduct, tags: e.target.value })} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" placeholder="electronics,audio" /></div>
              </div>
              <button onClick={handleUpdate} disabled={updateProductMut.isPending} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">{updateProductMut.isPending ? "Saving..." : t("common.save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── IMPORT MODAL ───────────────────────────────────────── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowImport(false); setImportData([]); setImportFileName(""); }} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t("admin.import")}</h2>
              <button onClick={() => { setShowImport(false); setImportData([]); setImportFileName(""); }} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* Upload zone */}
              <div
                className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => importRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImportFile(f); }}
              >
                <input ref={importRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }} />
                <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag CSV/Excel file here</p>
                <p className="text-[10px] text-muted-foreground mt-1">Supports .csv, .xlsx, .xls</p>
              </div>

              {importFileName && (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <CheckSquare size={14} /> {importFileName} ({importData.length} rows)
                </div>
              )}

              {/* Preview table */}
              {importData.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          {Object.keys(importData[0]).map(h => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            {Object.values(row).map((v, j) => (
                              <td key={j} className="px-3 py-2 text-muted-foreground whitespace-nowrap max-w-[150px] truncate">{String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importData.length > 5 && <p className="text-center text-[10px] text-muted-foreground py-2">...and {importData.length - 5} more rows</p>}
                  </div>
                </div>
              )}

              {importData.length > 0 && (
                <button
                  onClick={handleImportProducts}
                  disabled={createProduct.isPending}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {createProduct.isPending ? "Importing..." : `Import ${importData.length} Products`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
