import { useEffect } from "react";
import { useThemeStore } from "@/store/theme";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export default function SEO({
  title = "BulkHub - Wholesale Products for Your Business",
  description = "Buy quality products in bulk at wholesale prices. 100+ unit MOQ, secure payments, fast shipping.",
  image = "/og-image.jpg",
  type = "website",
}: SEOProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.title = title;

    const themeColor = theme === "dark" ? "#0c1222" : "#ffffff";

    const metaTags = [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "theme-color", content: themeColor },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const key = name ? `name="${name}"` : `property="${property}"`;
      let tag = document.querySelector(`meta[${key}]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement("meta");
        if (name) tag.setAttribute("name", name);
        if (property) tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });
  }, [title, description, image, type, theme]);

  return null;
}
