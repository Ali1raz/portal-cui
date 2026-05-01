---
name: nextjs-seomplementation
description: Implement production-grade SEO for Next.js 16 App Router. Covers metadata structure, OG images, robots configuration, and role-specific layouts for a full-stack portal with public and authenticated sections.
category: SEO
triggers:
  - "add SEO to my pages"
  - "set up metadata"
  - "configure OG images"
  - "add robots metadata"
  - "set up title templates"
  - "implement sitemaps"
  - "audit SEO setup"
  - "need SEO strategy"
applyTo: "next.js, app-router, metadata, seo, og-images"
---

# Next.js SEO Implementation Skill

## Overview

Implement production-grade SEO for Next.js 16 App Router applications with public and authenticated sections. This skill guides you through a **four-phase workflow** to add metadata, OG images, and robots rules systematically without disrupting your existing code.

**Best for:**

- Full-stack portals with mixed public/auth pages (like CUI Portal)
- Multi-role systems needing role-specific metadata
- Adding SEO without impacting performance
- Ensuring consistent search visibility strategy

---

## Phase 1: Analyze Your Architecture

**Goal:** Understand which pages need SEO and what your metadata strategy should be.

### Step 1.1: Map Public vs. Protected Pages

Ask yourself:

- Do I have **publicly accessible pages** (landing, blog, docs, public profiles)?
- Do I have **authenticated pages** (dashboards, admin panels, settings)?
- Are some pages **behind paywall or invite-only**?

**CUI Portal example:**

```
PUBLIC (index: true):
  - (public)/about
  - (public)/admissions
  - (public)/apply

PROTECTED (index: false):
  - (admin)/admin/...
  - (student)/student/...
  - (professor)/professor/...
  - (HOD)/hod/...
  - (accountant)/accountant/...
```

### Step 1.2: Identify Content Types

For each public page, categorize:

- **Static** (same content for everyone: about, pricing, docs)
- **Dynamic per record** (unique content: blog post, product, profile)
- **List/index** (collection views: blog list, product catalog)

Example mapping:
| Page Type | Public? | Dynamic? | OG Strategy |
|-----------|---------|----------|-------------|
| `/about` | ✅ | ❌ | Static image |
| `/blog/[slug]` | ✅ | ✅ | Dynamic `/api/og?title=...` |
| `/blog` | ✅ | ❌ | Static image |
| `/u/[username]` | ✅ | ✅ | Dynamic (photo, bio) |
| `/dashboard` | ❌ | ❌ | Skip OG entirely |

### Step 1.3: Choose Your Robots Strategy

Decide once per environment:

```ts
// Prod: index public pages, block auth pages
robots: {
  index: process.env.NODE_ENV === "production",
  follow: process.env.NODE_ENV === "production",
}

// Dev/staging: block everything
if (process.env.NEXT_PUBLIC_ENV !== "production") {
  robots: { index: false, follow: false }
}
```

---

## Phase 2: Set Up Root Metadata

**Goal:** Create site-wide defaults that all child pages inherit.

### Step 2.1: Configure Root Layout

Edit `app/layout.tsx` with site-wide metadata:

```ts
import { Metadata } from "next";

export const metadata: Metadata = {
  // Domain for relative URLs throughout the app
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

  // Title template: "%s | CUI Portal" → "Dashboard | CUI Portal"
  title: {
    template: "%s | CUI Portal",
    default: "CUI Portal",
  },

  description: "The CUI student and faculty management portal.",

  // Fallback OG image (static file in /public)
  openGraph: {
    siteName: "CUI Portal",
    type: "website",
    images: ["/og-default.png"],
  },

  // Twitter card format
  twitter: {
    card: "summary_large_image",
  },

  // Block indexing by default (overridden per page)
  robots: {
    index: false,
    follow: false,
  },
};
```

**Why `metadataBase`:** Lets you use relative URLs like `/api/og?title=...` instead of repeating your full domain everywhere.

### Step 2.2: Set Up Role-Specific Layouts

For multi-role systems, create a layout in each role group to customize the title template:

```ts
// app/(admin)/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | Admin · CUI Portal",
    default: "Admin · CUI Portal",
  },
  robots: { index: false, follow: false },
};

// app/(student)/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | Student Dashboard",
    default: "Student Dashboard",
  },
  robots: { index: false, follow: false },
};

// app/(HOD)/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | HOD · CUI Portal",
    default: "HOD · CUI Portal",
  },
  robots: { index: false, follow: false },
};
```

**Benefit:** If a user has 5 tabs open (admin, student, HOD views), the tab titles tell them apart instantly.

### Step 2.3: Add robots.txt (Optional but Recommended)

Create `public/robots.txt` to block crawlers site-wide:

```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/

Sitemap: https://yourdomain.com/sitemap.xml
```

---

## Phase 3: Implement Page-Level Metadata

**Goal:** Add specific metadata to each page using the decision tree.

### Step 3.1: Use the Decision Tree

For **every public page**, answer these questions:

```
Is this page publicly accessible?
├── No  → Set title only + robots: noindex. Skip OG.
└── Yes → Is content unique per record? (blog post, profile, product)
          ├── Yes  → Use generateMetadata() + dynamic OG
          └── No   → Static metadata + inherit OG from layout
```

### Step 3.2: Static Page (Marketing, Docs, Lists)

Use simple `export const metadata`:

```ts
// app/(public)/pricing/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "View CUI Portal pricing plans and features.",
  robots: { index: true, follow: true }, // Override root default
};

export default function PricingPage() {
  return <div>...</div>;
}
```

### Step 3.3: Dynamic Page (Blog, Profiles, Products)

Use `generateMetadata()` to fetch data and build OG URLs:

```ts
// app/(public)/blog/[slug]/page.tsx
import { Metadata, MetadataRoute } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post not found", robots: { index: false } };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    title: post.title, // Becomes "My Blog Title | CUI Portal"
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author.name],
      // Dynamic OG image with title param
      images: [
        `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&type=article`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [
        `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&type=article`,
      ],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}
```

### Step 3.4: Protected Page (Dashboard, Admin)

Minimal metadata — just title and robots:

```ts
// app/(student)/student/dashboard/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }, // Inherited from layout
};

export default async function DashboardPage() {
  const student = await getCurrentStudent();
  return <div>Welcome, {student.name}</div>;
}
```

---

## Phase 4: Implement OG Image Strategy

**Goal:** Choose and implement the right OG image approach for your content.

### Step 4.1: Choose Your Strategy

**1. Static (Simplest) — Same image for all public pages**

```ts
// In root layout or page metadata
openGraph: {
  images: ["/og-default.png"], // Static file in /public
}
```

✅ Use for:

- Static pages (about, pricing, docs)
- Small blogs
- When you don't have dynamic content

❌ Not ideal for:

- Content-heavy blogs or product catalogs
- Anything where social preview matters for CTR

**2. Dynamic per Page — Generated with title/params**

```ts
// In /api/og route (uses @vercel/og)
import { ImageResponse } from "@vercel/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "CUI Portal";

  return new ImageResponse(
    (
      <div style={{ ...containerStyle }}>
        <h1>{title}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

Then use it in your metadata:

```ts
images: [`/api/og?title=${encodeURIComponent(post.title)}`];
```

✅ Use for:

- Blog posts, news articles
- Product pages
- Public profiles
- Any page where title/content is unique per record

**3. Custom with Assets — Full design per page**

```ts
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  return {
    openGraph: {
      images: [
        {
          url: `/og/${post.id}.png`, // Pre-generated or generated on-demand
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}
```

✅ Use for:

- High-traffic content (blog homepages, featured posts)
- Anything with custom branding, photos, or design

❌ Too much work for:

- Thousands of pages
- Internal content
- Content that rarely changes

### Step 4.2: Install @vercel/og (if using dynamic images)

```bash
pnpm add @vercel/og
```

### Step 4.3: Create `/api/og` Route Handler

```ts
// app/api/og/route.tsx
import { ImageResponse } from "@vercel/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const type = searchParams.get("type") || "default";

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
        }}
      >
        <div
          style={{
            maxWidth: "80%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title || "CUI Portal"}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

---

## Phase 5: Configure Robots Metadata

**Goal:** Control which pages Google indexes.

### Step 5.1: Understand robots Metadata

```ts
robots: {
  index: true,   // Include in search results
  follow: true,  // Crawl links on this page
}
```

**Combinations:**

| Situation                | index | follow | Use case                               |
| ------------------------ | ----- | ------ | -------------------------------------- |
| Public page              | ✅    | ✅     | Blog posts, landing pages              |
| Auth page                | ❌    | ❌     | Dashboards, admin panels               |
| Paginated list (?page=2) | ❌    | ✅     | Don't index pages 2+, but follow links |
| Staging/preview          | ❌    | ❌     | Block entire staging environment       |

### Step 5.2: Set Root Default

In `app/layout.tsx`:

```ts
// Block everything by default (for a private app)
robots: {
  index: false,
  follow: false,
}
```

### Step 5.3: Override for Public Pages

```ts
// app/(public)/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  return {
    // ... other metadata
    robots: {
      index: true,
      follow: true,
    },
  };
}
```

### Step 5.4: Block Staging Environment

```ts
// app/layout.tsx
export const metadata: Metadata = {
  robots: {
    index: process.env.NEXT_PUBLIC_ENV === "production",
    follow: process.env.NEXT_PUBLIC_ENV === "production",
  },
};
```

---

## Phase 6: Add Sitemap (Optional)

**Goal:** Help Google discover and prioritize your public pages.

Create `app/sitemap.ts`:

```ts
import { MetadataRoute } from "next";

export default async function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/admissions`, lastModified: new Date() },
  ];

  // Dynamic blog posts
  const posts = await getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...blogPages];
}
```

Register in `next.config.ts`:

```ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    sitemap: ["app/sitemap.ts"],
  },
};
```

---

## Quick Reference

### Checklist for Each Page

- [ ] **Is it public?** If no → skip to robots-only
- [ ] **Is content unique per record?** If yes → use `generateMetadata()`
- [ ] **Title format correct?** (under 60 chars, specific)
- [ ] **Description included?** (50–160 chars, action-oriented)
- [ ] **OG images configured?** (if public)
- [ ] **robots set correctly?** (index for public, noindex for auth)

### Common Patterns

**Static public page:**

```ts
export const metadata: Metadata = {
  title: "About",
  description: "Learn about CUI Portal.",
  robots: { index: true, follow: true },
};
```

**Dynamic public page:**

```ts
export async function generateMetadata({ params }) {
  const item = await getItem(params.id);
  return {
    title: item.title,
    description: item.summary,
    openGraph: { images: [`/api/og?title=${encodeURIComponent(item.title)}`] },
    robots: { index: true, follow: true },
  };
}
```

**Protected page:**

```ts
export const metadata: Metadata = {
  title: "Dashboard",
};
// robots inherited from layout
```

---

## When to Use This Skill

✅ **Use when:**

- Setting up SEO on a new Next.js 16 app
- Adding metadata to existing pages systematically
- Implementing OG images for social sharing
- Auditing or fixing SEO configuration
- Need to understand robots metadata

❌ **Don't use when:**

- Already have comprehensive SEO set up
- Only fixing a single page (just edit that page directly)
- Building client-side only apps (Next.js advantages won't help)

---

## Common Mistakes to Avoid

1. **Setting `index: true` on auth pages** — Use robots to block crawlers from dashboards
2. **Forgetting `metadataBase`** — Relative OG URLs won't work without it
3. **Not overriding in role-specific layouts** — Title templates get confusing without per-role customization
4. **Using robots for security** — `noindex` doesn't make content private; use authentication
5. **Repeating the title format on root page** — Let the `default` handle it
6. **OG images larger than 1.2MB** — Social platforms resize/cache; keep under 500KB

---

## Debugging

**Problem: Pages don't appear in Google**
→ Check `robots: { index: true }` on the page or its parent layout

**Problem: Old OG preview cached**
→ Share the URL again on Discord/Twitter to bust the cache, or use a new URL param

**Problem: Title formatting looks wrong**
→ Check if you have conflicting templates in parent layouts. Child layout template overrides parent.

**Problem: `/api/og` images not rendering**
→ Make sure `@vercel/og` is installed and you're using dynamic image generation correctly
