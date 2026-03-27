import { FeatureSection } from "@/components/feature-section";
import { Features } from "@/components/features-12";
import FooterSection from "@/components/general/footer";
import { HeroSection } from "@/components/general/hero-section";
import { Integrations } from "@/components/integrations";

export default function Page() {
  return (
    <>
      <HeroSection />
      <section className="place-content-center p-4">
        <FeatureSection />
      </section>
      <Features />
      <div className="place-content-center p-4">
        <Integrations />
      </div>
      <FooterSection />
    </>
  );
}
