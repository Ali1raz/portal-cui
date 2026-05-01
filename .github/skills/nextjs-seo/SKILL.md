---
name: nextjs-seo
description: >
  Add production-grade SEO to an existing Next.js project (App Router). Use this skill whenever
  the user wants to improve SEO, add metadata, set up Open Graph tags, Twitter Cards, JSON-LD
  structured data, sitemaps, robots.txt, canonical URLs, or dynamic OG images in a Next.js app.
  Also trigger for requests like "my site doesn't show up on Google", "add meta tags", "set up
  social sharing previews", "generate sitemap", "add schema markup", or any SEO audit/fix task
  in a Next.js codebase. Works with Next.js 13+ App Router (pages/router patterns in references/).
---

# Next.js SEO Skill

A step-by-step playbook for adding complete, production-ready SEO to an **existing** Next.js
(App Router) project. Covers the full stack: metadata API, Open Graph, Twitter Cards, JSON-LD,
sitemap, robots, canonical URLs, and dynamic OG images.

---

## Quick Decision Tree

```
Is the page static (no runtime data)?
  YES → export const metadata = { ... }          (see §1)
  NO  → export async function generateMetadata() (see §2)

Does the project have dynamic routes (/blog/[slug], /products/[id])?
  YES → generateMetadata + generateStaticParams  (see §2)

Does the site need social sharing previews?
  YES → Open Graph + Twitter Cards               (see §3)

Does the site need rich Google snippets?
  YES → JSON-LD structured data                  (see §4)

Does the site need a sitemap / robots.txt?
  YES → sitemap.ts + robots.ts                   (see §5)
```

---

## Step 0 — Audit the Existing Project First

Before writing any code, run this mental audit:

1. **Check** `app/layout.tsx` — does it already export `metadata`? If yes, note what's there
2. **Check** for `<Head>` usage (old Pages Router pattern) — must migrate to Metadata API
3. **Find** all dynamic routes: `app/**/[slug]/page.tsx`, `app/**/[id]/page.tsx`
4. **Check** `next.config.ts` for `metadataBase` — if missing, OG image URLs will be relative (broken)
5. **Look** for existing `sitemap.xml` or `robots.txt` in `/public` — these must be removed
   if you add programmatic versions

Ask the user: _What is the site's production URL?_ (needed for `metadataBase` and canonical URLs)

---

## §1 — Global Defaults in `app/layout.tsx`

Every project needs a root metadata export. This is the baseline all pages inherit from.

```tsx
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://yoursite.com"), // REQUIRED — absolute URL base
  title: {
    default: "Your Site Name",
    template: "%s | Your Site Name", // child pages: "About | Your Site Name"
  },
  description: "What your site does in 150–160 characters.",
  authors: [{ name: "Your Name", url: "https://yoursite.com" }],
  creator: "Your Name",
  keywords: ["keyword1", "keyword2"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Your Site Name",
    title: "Your Site Name",
    description: "What your site does in 150–160 characters.",
    images: [
      {
        url: "/opengraph-image.png", // 1200×630px, place in /public or /app
        width: 1200,
        height: 630,
        alt: "Your Site Name",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    creator: "@yourtwitterhandle",
    title: "Your Site Name",
    description: "What your site does in 150–160 characters.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

**Key rules:**

- `metadataBase` must be an absolute URL — without it, OG image URLs break on social platforms
- Title `template` uses `%s` as placeholder for the page-level title
- Set `robots.index: false` on auth/dashboard/preview routes (see §6)

---

## §2 — Static & Dynamic Page Metadata

### Static pages (no runtime data)

```tsx
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',                          // renders as "About Us | Your Site Name"
  description: 'Learn about our team and mission.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Us',
    description: 'Learn about our team and mission.',
    url: '/about',
    type: 'website',
  },
}

export default function AboutPage() { ... }
```

### Dynamic pages (data-driven — blog, products, etc.)

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug); // your data-fetching function

  if (!post)
    return { title: "Not Found", robots: { index: false, follow: false } };

  // Inherit parent OG images as fallback
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title, // template applies: "Post Title | Site Name"
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.image
        ? [{ url: post.image, width: 1200, height: 630, alt: post.title }]
        : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  };
}

// Enable static generation for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
```

**Common mistakes to avoid:**

- Using `generateMetadata` on static pages adds overhead — use `export const metadata` instead
- Client components (`'use client'`) cannot export metadata — wrap them in a server component layout
- Missing `canonical` on dynamic routes causes duplicate-content penalties

---

## §3 — Open Graph & Twitter Cards

Covered by the `openGraph` and `twitter` fields above. Additional tips:

| Field              | Requirement                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `og:image` size    | 1200×630px — works on Twitter, Facebook, LinkedIn                           |
| `og:type`          | `website` for homepages, `article` for blog posts, `product` for e-commerce |
| `twitter:card`     | `summary_large_image` for large image previews                              |
| Description length | 150–160 characters — longer gets truncated                                  |
| Title length       | Under 60 characters for clean search results                                |

Test your tags:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## §4 — JSON-LD Structured Data

Add to any page by injecting a `<script>` tag in the page component (not in metadata):

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
      url: `https://yoursite.com/authors/${post.authorSlug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Your Site Name",
      logo: { "@type": "ImageObject", url: "https://yoursite.com/logo.png" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* page content */}
    </>
  );
}
```

Common schema types: `Article`, `Product`, `BreadcrumbList`, `FAQPage`, `Person`, `Organization`.
See `references/json-ld-schemas.md` for ready-to-paste templates.

Validate at: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## §5 — Sitemap & Robots

### Dynamic sitemap (`app/sitemap.ts`)

```ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://yoursite.com";
  const posts = await getAllPosts();

  const postUrls = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: base, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...postUrls,
  ];
}
```

**Remove any static `public/sitemap.xml`** — the programmatic version takes precedence only if
the static file is absent.

### Robots (`app/robots.ts`)

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/admin/"],
      },
    ],
    sitemap: "https://yoursite.com/sitemap.xml",
  };
}
```

---

## §6 — Noindex Private/Low-Value Routes

Add to any layout or page that should not be indexed:

```tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};
```

Apply to: `/dashboard`, `/account`, `/admin`, `/search`, `/preview`, `/api/*`, paginated
duplicate routes (`?page=2` etc.), staging environments.

---

## §7 — Dynamic OG Images (`opengraph-image.tsx`)

Generate a unique social preview image per page using `next/og`:

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return new ImageResponse(
    <div
      style={{
        background: "#0f172a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "60px",
      }}
    >
      <p style={{ color: "#94a3b8", fontSize: 24 }}>{post.category}</p>
      <h1 style={{ color: "#f8fafc", fontSize: 60, lineHeight: 1.1 }}>
        {post.title}
      </h1>
      <p style={{ color: "#64748b", fontSize: 24 }}>{post.author}</p>
    </div>,
    { ...size }
  );
}
```

Place `opengraph-image.tsx` inside the relevant route folder. Next.js auto-wires the image URL
into that route's metadata — no extra metadata config needed.

---

## §8 — Reusable SEO Helpers (`lib/seo.ts`)

For larger projects, centralise defaults to keep pages DRY:

```ts
// lib/seo.ts
import type { Metadata } from "next";

const SITE_URL = "https://yoursite.com";
const SITE_NAME = "Your Site Name";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  const image = opts.image ?? DEFAULT_OG_IMAGE;

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: opts.type ?? "website",
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
```

Usage in a page:

```tsx
export const metadata = buildPageMetadata({
  title: "About Us",
  description: "Meet the team.",
  path: "/about",
});
```

---

## Implementation Checklist

Before considering SEO "done", verify each item:

- [ ] `metadataBase` set in root `layout.tsx`
- [ ] Title template configured (`%s | Site Name`)
- [ ] Default `description`, `openGraph`, and `twitter` in root layout
- [ ] Every static page has `metadata` with unique `title`, `description`, `canonical`
- [ ] All dynamic routes use `generateMetadata` with per-item title/description
- [ ] `openGraph.images` uses 1200×630px images
- [ ] JSON-LD added to article/product/person pages
- [ ] `app/sitemap.ts` covers all public routes
- [ ] `app/robots.ts` blocks private routes
- [ ] Dashboard/admin/search routes have `robots: { index: false }`
- [ ] No static `public/sitemap.xml` or `public/robots.txt` conflicts
- [ ] OG tags validated via Facebook Debugger
- [ ] JSON-LD validated via Google Rich Results Test
- [ ] Site submitted to Google Search Console

---

## Reference Files

Read these when you need ready-to-paste code for specific scenarios:

- `references/json-ld-schemas.md` — Templates for Article, Product, BreadcrumbList, FAQ, Person
- `references/pages-router.md` — Equivalent patterns for the older Pages Router (`next/head`)
- `references/i18n-seo.md` — `hreflang` alternates for multilingual sites
