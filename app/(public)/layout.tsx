import { Metadata } from "next";
import { Footer } from "@/components/footer";
import { HeroHeader } from "@/components/general/Header";

export const metadata: Metadata = {
  title: {
    template: "%s | COMSATS University Islamabad",
    default: "COMSATS University Islamabad",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <HeroHeader />
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-32">{children}</div>
      <Footer />
    </main>
  );
}
