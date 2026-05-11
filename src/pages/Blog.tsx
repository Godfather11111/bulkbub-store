import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Calendar, User, Mail } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import SEO from "@/components/SEO";

export default function Blog() {
  const { t } = useTranslation();
  const { data: posts, isLoading } = trpc.product.blogPosts.useQuery();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Blog - BulkHub" description="Tips, reviews, and insights for wholesale buyers." />
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 lg:py-12">
        <div className="mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-medium">From the Blog</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Useful Articles & Guides</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl">Tips, reviews, and insights to help you make the best choices.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="h-48 bg-secondary/50" />
                <div className="p-5 space-y-2"><div className="h-3 w-20 bg-secondary rounded" /><div className="h-4 w-full bg-secondary rounded" /><div className="h-4 w-3/4 bg-secondary rounded" /></div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300 card-lift">
                <div className="h-48 bg-secondary/50 flex items-center justify-center">
                  <div className="text-5xl font-bold text-muted-foreground/20 tracking-wider uppercase">{post.category?.slice(0, 3)}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] text-primary font-medium tracking-wider uppercase px-2 py-0.5 bg-primary/10 rounded">{post.category}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User size={10} />{post.author}</span>
                    <Link to={`/blog`} className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t("blog.readMore")} <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><p className="text-lg text-muted-foreground">No articles yet.</p></div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 p-8 bg-card rounded-xl border border-border text-center">
          <Mail size={24} className="mx-auto text-primary mb-3" />
          <h3 className="text-lg font-semibold text-foreground">Subscribe to Our Newsletter</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">Get the latest wholesale tips, product updates, and exclusive deals.</p>
          <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 w-full px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
