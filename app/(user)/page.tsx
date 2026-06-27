import { Features } from "@/components/features-12";
import FooterSection from "@/components/general/footer";
import { HeroHeader } from "@/components/general/Header";
import { Integrations } from "@/components/integrations";
import { Team } from "@/components/team1";
import Image from "next/image";

export default function Page() {
  return (
    <main>
      <HeroHeader />
      <section className="md:mt-44 mt-28 p-4">
        <div className="sm:text-center text-left max-w-4xl sm:mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your university, finally organized. From submission to resolution
            all tracked.
          </h2>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            Built for{" "}
            <span className="text-primary font-bold">COMSATS&apos;s</span>{" "}
            existing portal, this system brings structured workflows to the four
            things that were always handled informally leave approvals,
            institutional announcements, fee installment splits and student
            complaints — with full audit trails and zero dropped handoffs.
          </p>
        </div>
      </section>

      <div className="relative aspect-video overflow-hidden rounded-lg select-none mt-8">
        <Image
          src="/images/student-dashbaord-dark.png"
          alt="Student Dashboard"
          fill
          className="object-contain px-8 hidden dark:block"
          priority
        />
        <Image
          src="/images/student-dashbaord-light.png"
          alt="Student Dashboard"
          fill
          className="object-contain px-8 dark:hidden block"
          priority
        />
      </div>

      <Features />
      <Team />
      <div className="place-content-center p-4">
        <Integrations />
      </div>
      <FooterSection />
    </main>
  );
}
