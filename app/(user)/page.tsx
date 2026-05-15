import { FeatureSection } from "@/components/feature-section";
import { Features } from "@/components/features-12";
import FooterSection from "@/components/general/footer";
import { HeroHeader } from "@/components/general/Header";
import { Integrations } from "@/components/integrations";
import { Team } from "@/components/team1";

export default function Page() {
  return (
    <>
      <HeroHeader />
      <section className="mt-18">
        <Features />
      </section>
      <section className="place-content-center p-4">
        <FeatureSection />
      </section>
      <Team />
      <div className="place-content-center p-4">
        <Integrations />
      </div>
      <FooterSection />
    </>
  );
}
