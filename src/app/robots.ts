import type { MetadataRoute } from "next";

/** Discourage crawlers from indexing app shells. Does not stop humans. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/product", "/security", "/about", "/contact", "/blog", "/privacy", "/roi-calculator"],
        disallow: [
          "/login",
          "/dashboard",
          "/pricing-requests",
          "/approvals",
          "/negotiations",
          "/analytics",
          "/knowledge",
          "/clients",
          "/settings",
          "/client-portal",
          "/portal",
          "/api/",
        ],
      },
    ],
  };
}
