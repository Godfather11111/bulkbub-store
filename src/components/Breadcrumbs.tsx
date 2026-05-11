import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  items?: { label: string; path?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const location = useLocation();

  // Auto-generate from path if no items provided
  const autoItems = items || (() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];
    return segments.map((segment, idx) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      path: idx < segments.length - 1 ? "/" + segments.slice(0, idx + 1).join("/") : undefined,
    }));
  })();

  if (autoItems.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
      <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Home size={12} />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {autoItems.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-border shrink-0" />
          {item.path ? (
            <Link to={item.path} className="hover:text-primary transition-colors">{item.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
