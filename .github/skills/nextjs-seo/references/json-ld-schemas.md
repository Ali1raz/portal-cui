# JSON-LD Schema Templates

Ready-to-paste structured data for common Next.js page types.
Inject via `<script type="application/ld+json">` in the page component (not in metadata).

---

## Article / Blog Post

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.excerpt,
  image: post.coverImage,
  datePublished: post.publishedAt, // ISO 8601: "2025-01-15T08:00:00Z"
  dateModified: post.updatedAt,
  url: `https://yoursite.com/blog/${post.slug}`,
  author: {
    "@type": "Person",
    name: post.author.name,
    url: `https://yoursite.com/authors/${post.author.slug}`,
  },
  publisher: {
    "@type": "Organization",
    name: "Your Site Name",
    logo: {
      "@type": "ImageObject",
      url: "https://yoursite.com/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://yoursite.com/blog/${post.slug}`,
  },
};
```

---

## Product Page (e-commerce)

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.images, // array of image URLs
  sku: product.sku,
  brand: {
    "@type": "Brand",
    name: product.brand,
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: product.price.toString(),
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: `https://yoursite.com/products/${product.slug}`,
    seller: { "@type": "Organization", name: "Your Site Name" },
  },
  // Optional: add aggregateRating if you have reviews
  aggregateRating: product.rating
    ? {
        "@type": "AggregateRating",
        ratingValue: product.rating.average,
        reviewCount: product.rating.count,
      }
    : undefined,
};
```

---

## BreadcrumbList

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://yoursite.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: "https://yoursite.com/blog",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: `https://yoursite.com/blog/${post.slug}`,
    },
  ],
};
```

---

## FAQ Page

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};
```

---

## Person (author/profile page)

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: author.name,
  url: `https://yoursite.com/authors/${author.slug}`,
  image: author.avatar,
  jobTitle: author.title,
  worksFor: {
    "@type": "Organization",
    name: "Your Company",
  },
  sameAs: [
    author.twitter ? `https://twitter.com/${author.twitter}` : null,
    author.linkedin,
    author.github ? `https://github.com/${author.github}` : null,
  ].filter(Boolean),
};
```

---

## Organization (homepage / about page)

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Your Site Name",
  url: "https://yoursite.com",
  logo: "https://yoursite.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@yoursite.com",
  },
  sameAs: [
    "https://twitter.com/yourtwitterhandle",
    "https://linkedin.com/company/yourcompany",
  ],
};
```

---

## How to Inject (server component)

```tsx
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* rest of page */}
    </>
  );
}
```

Validate at: https://search.google.com/test/rich-results
