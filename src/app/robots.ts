import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? "https://lysp.ai";

/** Discourage crawlers from indexing app shells. Does not stop humans. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/product", "/security", "/about", "/contact", "/blog", "/privacy", "/roi-calculator"],
        disallow: [
          "/login",
          "/client-login",
          "/dashboard",
          "/pricing-requests",
          "/approvals",
          "/negotiations",
          "/analytics",
          "/knowledge",
          "/clients",
          "/settings",
          "/audit-trail",
          "/client-portal",
          "/portal",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
