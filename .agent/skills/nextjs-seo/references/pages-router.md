# Pages Router SEO (next/head)

For Next.js projects still using the **Pages Router** (`pages/` directory).
Use `next/head` instead of the Metadata API.

---

## `_app.tsx` — Global defaults

```tsx
// pages/_app.tsx
import Head from "next/head";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Default OG image — overridden per page */}
        <meta
          property="og:image"
          content="https://yoursite.com/opengraph-image.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
```

---

## Static page

```tsx
// pages/about.tsx
import Head from "next/head";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | Your Site Name</title>
        <meta name="description" content="Learn about our team and mission." />
        <link rel="canonical" href="https://yoursite.com/about" />
        <meta property="og:title" content="About Us" />
        <meta
          property="og:description"
          content="Learn about our team and mission."
        />
        <meta property="og:url" content="https://yoursite.com/about" />
        <meta property="og:type" content="website" />
      </Head>
      {/* page content */}
    </>
  );
}
```

---

## Dynamic page with `getStaticProps`

```tsx
// pages/blog/[slug].tsx
import Head from "next/head";
import type { GetStaticProps, GetStaticPaths } from "next";

interface Props {
  post: { title: string; excerpt: string; slug: string; image: string };
}

export default function BlogPost({ post }: Props) {
  return (
    <>
      <Head>
        <title>{`${post.title} | Your Site Name`}</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://yoursite.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta
          property="og:url"
          content={`https://yoursite.com/blog/${post.slug}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:image" content={post.image} />
      </Head>
      {/* page content */}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPost(params!.slug as string);
  if (!post) return { notFound: true };
  return { props: { post }, revalidate: 60 };
};
```

---

## Sitemap for Pages Router

Use a dynamic API route or a package like `next-sitemap`:

```bash
npm install next-sitemap
```

```js
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://yoursite.com",
  generateRobotsTxt: true,
  exclude: ["/dashboard", "/admin", "/api/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin"] },
    ],
  },
};
```

Add to `package.json`:

```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

---

## Migration note

When migrating from Pages Router to App Router, remove all `<Head>` blocks and replace with:

- `export const metadata = { ... }` for static pages
- `export async function generateMetadata()` for dynamic pages
