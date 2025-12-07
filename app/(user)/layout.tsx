import { HeroHeader } from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <HeroHeader />
      {children}
    </main>
  );
}
