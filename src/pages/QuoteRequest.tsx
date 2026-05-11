import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, Send, CheckCircle, Package, FileText } from "lucide-react";
import { trpc } from "@/providers/trpc";
import SEO from "@/components/SEO";

export default function QuoteRequest() {
  const [searchParams] = useSearchParams();
  const productParam = searchParams.get("product");
  const productId = searchParams.get("productId");

  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "",
    productName: productParam || "", productId: productId ? Number(productId) : undefined,
    quantity: 100, message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitQuote = trpc.admin.submitQuote.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuote.mutate({
      name: form.name,
      email: form.email,
      company: form.company || undefined,
      phone: form.phone || undefined,
      productName: form.productName || undefined,
      productId: form.productId,
      quantity: form.quantity,
      message: form.message || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Request a Quote - BulkHub" description="Get custom wholesale pricing for bulk orders. MOQ 100+ units." />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-12 max-w-3xl mx-auto">
        <Link to="/shop" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        {submitted ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Quote Request Submitted</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">Thank you! Our team will review your request and respond within 24 business hours with custom pricing.</p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">Wholesale Pricing</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Request a Custom Quote</h1>
              <p className="mt-3 text-sm text-muted-foreground">Tell us what you need and we'll get back to you with competitive wholesale pricing within 24 hours.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[{ icon: Package, title: "Bulk Orders", desc: "100+ units per product" }, { icon: FileText, title: "Custom Pricing", desc: "Volume discounts available" }, { icon: Send, title: "Fast Response", desc: "Within 24 business hours" }].map((item) => (
                <div key={item.title} className="p-4 bg-card border border-border rounded-xl text-center">
                  <item.icon size={24} className="mx-auto text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-xl p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Full Name *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="john@company.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your Company LLC" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Product Name</label>
                  <input type="text" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Product you're interested in" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Quantity Needed *</label>
                  <input required type="number" min="100" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Additional Details</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Tell us about your requirements, target price, delivery timeline, etc." />
              </div>
              <button type="submit" disabled={submitQuote.isPending} className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send size={16} /> {submitQuote.isPending ? "Submitting..." : "Submit Quote Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
