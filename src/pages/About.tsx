import { Link } from "react-router";
import { Truck, Shield, Headphones, Package, TrendingUp, Users, Globe, Award, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="About BulkHub - Wholesale Marketplace" description="Your trusted wholesale partner. Quality products, competitive prices, MOQ 100+ units." />

      {/* Hero */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-16 lg:py-24 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-medium">About Us</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight max-w-3xl mx-auto">
          Your Trusted Wholesale Partner
        </h1>
        <p className="mt-5 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          BulkHub connects businesses with quality products at wholesale prices. We specialize in bulk orders with a minimum quantity of 100 units, making us the ideal partner for retailers, distributors, and enterprises.
        </p>
      </div>

      {/* How It Works */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 lg:py-16 border-y border-border bg-card/30">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">Process</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { step: "01", title: "Browse Products", desc: "Explore our catalog across 5 categories with 20+ subcategories. Filter by price, rating, and availability." },
            { step: "02", title: "Select Quantity", desc: "Choose your products with our MOQ of 100 units per item. The more you order, the better the price." },
            { step: "03", title: "Secure Checkout", desc: "Pay securely with Visa, Mastercard, PayPal, Alipay, or WeChat Pay. SSL encrypted transactions." },
            { step: "04", title: "Fast Delivery", desc: "Free shipping on orders over $75. Track your shipment from warehouse to your door." },
          ].map((item) => (
            <div key={item.step} className="relative text-center p-6">
              <span className="text-5xl font-bold text-primary/10 absolute top-2 left-1/2 -translate-x-1/2">{item.step}</span>
              <div className="relative z-10 mt-6">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Package, value: "32+", label: "Products" },
            { icon: Users, value: "5", label: "Categories" },
            { icon: Globe, value: "20+", label: "Subcategories" },
            { icon: Award, value: "100%", label: "Quality Guaranteed" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 bg-card border border-border rounded-xl">
              <stat.icon size={24} className="mx-auto text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 lg:py-16 bg-card/30 border-y border-border">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">Why Us</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Why Buy Wholesale from BulkHub</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { icon: TrendingUp, title: "Competitive Pricing", desc: "Direct from manufacturers means better margins for your business. Volume discounts available." },
            { icon: Package, title: "MOQ: 100 Units", desc: "Our minimum order quantity ensures wholesale pricing that makes sense for both buyers and suppliers." },
            { icon: Shield, title: "Secure Payments", desc: "PCI compliant checkout with Stripe. Accept Visa, Mastercard, PayPal, Alipay, and WeChat Pay." },
            { icon: Truck, title: "Fast Shipping", desc: "Free shipping on orders over $75. Express options available for urgent orders." },
            { icon: Headphones, title: "Dedicated Support", desc: "Our wholesale specialists are here to help with product selection, pricing, and logistics." },
            { icon: Award, title: "Quality Assured", desc: "Every product is vetted for quality. Return anything that doesn't meet your standards within 30 days." },
          ].map((b) => (
            <div key={b.title} className="p-5 bg-card border border-border rounded-xl hover:border-primary transition-colors">
              <b.icon size={20} className="text-primary mb-3" />
              <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">Ready to Start Buying Wholesale?</h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">Browse our catalog or request a custom quote for your specific needs.</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/shop" className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">Browse Products <ArrowRight size={16} /></Link>
          <Link to="/quote" className="flex items-center gap-2 px-6 py-3 border border-input text-foreground rounded-lg text-sm tracking-wider uppercase hover:border-primary transition-colors">Request a Quote</Link>
        </div>
      </div>
    </div>
  );
}
