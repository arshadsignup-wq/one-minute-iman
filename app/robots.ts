import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required by `output: export`: these Metadata routes compile to Route
// Handlers, which must declare themselves static to be prerendered.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // Google needs the JS and CSS to render these pages, so nothing is blocked.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
