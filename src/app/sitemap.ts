import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/components/landing/company/blogPosts";

const SITE_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? "https://lysp.ai";

/**
 * Only the public marketing routes belong here — the firm app, client portal and login
 * screens sit behind auth and gain nothing from being crawled or listed in search results.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/product`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/security`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/roi-calculator`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes];
}
