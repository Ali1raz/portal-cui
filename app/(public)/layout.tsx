import { Footer } from "@/components/footer";
import { HeroHeader } from "@/components/general/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-5xl mx-auto">
      <HeroHeader />
      {children}
      <Footer />
    </main>
  );
}
