import { Link } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <SEO title="Page Not Found - BulkHub" />
      <div className="text-center px-4">
        <h1 className="text-6xl sm:text-8xl font-bold text-primary tracking-tight">
          404
        </h1>
        <h2 className="mt-4 text-xl sm:text-2xl font-medium text-foreground">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-input text-foreground rounded-lg text-sm tracking-wider uppercase hover:border-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium tracking-wider uppercase hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
