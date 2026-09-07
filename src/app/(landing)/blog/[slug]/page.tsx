import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { BLOG_POSTS } from "@/components/landing/company/blogPosts";
import { BlogArticleContent } from "@/components/landing/company/BlogArticleContent";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Blog - Lysp" };
  return {
    title: `${post.title} - Lysp`,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar />
      <main className="pt-14 sm:pt-16">
        <BlogArticleContent post={post} />
      </main>
      <FooterSection />
    </div>
  );
}
