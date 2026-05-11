import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube, Check, ArrowRight } from "lucide-react";

const shopLinks = [
  { label: "All Products", path: "/shop" },
  { label: "Electronics", path: "/shop?category=electronics" },
  { label: "Fashion", path: "/shop?category=fashion" },
  { label: "Home & Living", path: "/shop?category=home-living" },
  { label: "Sports", path: "/shop?category=sports" },
  { label: "Beauty", path: "/shop?category=beauty" },
];

const supportLinks = [
  { label: "Contact Us", path: "/about" },
  { label: "FAQs", path: "/about" },
  { label: "Shipping Info", path: "/about" },
  { label: "Returns Policy", path: "/about" },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

function Newsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mb-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("footer.newsletter", "Subscribe to our newsletter")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("footer.newsletterDesc", "Get deals, new product alerts, and wholesale tips.")}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full lg:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("footer.emailPlaceholder", "Enter your email")}
            className="flex-1 lg:w-64 px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center gap-1.5 shrink-0"
          >
            {subscribed ? <><Check size={14} /> {t("footer.subscribed", "Done")}</> : <><ArrowRight size={14} /> {t("footer.subscribe", "Subscribe")}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function FooterContent() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-16 lg:py-20">
        <Newsletter />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-[0.2em] text-foreground hover:text-primary transition-colors">BULKHUB</Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">{t("footer.brandDesc", "Your trusted wholesale partner. Quality products at bulk prices with MOQ 100+. Secure payments, fast shipping worldwide.")}</p>
            {/* Social links */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 hover:scale-105"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
            {/* Payment methods */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {["Visa", "Mastercard", "PayPal", "Alipay", "WeChat Pay"].map((method) => (
                <span key={method} className="px-2 py-1 bg-background border border-input rounded text-[9px] text-muted-foreground font-medium tracking-wider">{method.toUpperCase()}</span>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-foreground font-medium mb-5">{t("footer.shop", "Shop")}</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.path}><Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/quote" className="text-sm text-muted-foreground hover:text-primary transition-colors">Request a Quote</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-foreground font-medium mb-5">{t("footer.support", "Support")}</h3>
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item.label}><Link to={item.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-foreground font-medium mb-5">{t("footer.contact", "Contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3"><Mail size={16} className="text-primary mt-0.5 shrink-0" /><span className="text-sm text-muted-foreground">hello@bulkhub.store</span></li>
              <li className="flex items-start gap-3"><Phone size={16} className="text-primary mt-0.5 shrink-0" /><span className="text-sm text-muted-foreground">+1 (555) 000-0000</span></li>
              <li className="flex items-start gap-3"><MapPin size={16} className="text-primary mt-0.5 shrink-0" /><span className="text-sm text-muted-foreground">123 Design Street<br />San Francisco, CA 94102</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BulkHub Store. {t("footer.rights", "All rights reserved.")}</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return <FooterContent />;
}
