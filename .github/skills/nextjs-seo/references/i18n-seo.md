# i18n SEO — hreflang & Multilingual Metadata

For Next.js projects with multiple locales using the App Router.

---

## Layout-level alternates

```tsx
// app/[locale]/layout.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://yoursite.com/${params.locale}`,
      languages: {
        "en-US": "https://yoursite.com/en",
        "de-DE": "https://yoursite.com/de",
        "fr-FR": "https://yoursite.com/fr",
        "x-default": "https://yoursite.com/en", // fallback for unmatched regions
      },
    },
  };
}
```

This generates:

```html
<link rel="canonical" href="https://yoursite.com/en" />
<link rel="alternate" hreflang="en-US" href="https://yoursite.com/en" />
<link rel="alternate" hreflang="de-DE" href="https://yoursite.com/de" />
<link rel="alternate" hreflang="fr-FR" href="https://yoursite.com/fr" />
<link rel="alternate" hreflang="x-default" href="https://yoursite.com/en" />
```

---

## Dynamic page alternates

```tsx
// app/[locale]/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);

  // Build alternate URLs for all available translations
  const languages: Record<string, string> = {};
  for (const loc of ["en", "de", "fr"]) {
    languages[loc] = `https://yoursite.com/${loc}/blog/${slug}`;
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://yoursite.com/${locale}/blog/${slug}`,
      languages,
    },
    openGraph: {
      locale: locale === "de" ? "de_DE" : locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: ["en_US", "de_DE", "fr_FR"].filter(
        (l) => l !== (locale === "de" ? "de_DE" : "en_US")
      ),
    },
  };
}
```

---

## Multilingual sitemap

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

const locales = ["en", "de", "fr"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // Static routes
    entries.push({
      url: `https://yoursite.com/${locale}`,
      changeFrequency: "weekly",
      priority: 1.0,
    });

    // Dynamic routes
    for (const post of posts) {
      entries.push({
        url: `https://yoursite.com/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
```

---

## Rules

- Always include `x-default` pointing to your default/English version
- Use the full locale format (`en-US`, `de-DE`) in `hreflang` — not just `en` or `de`
- Every page must link to ALL its translations including itself
- Missing a locale in hreflang causes Google to ignore the entire hreflang set
