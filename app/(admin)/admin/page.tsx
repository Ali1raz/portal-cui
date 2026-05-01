import { Metadata } from "next";
import { ChartAreaInteractive } from "@/app/(director)/_components/chart-area-interactive";
import { SectionCards } from "@/app/(director)/_components/section-cards";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard.",
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
          <SectionCards />
          <div>
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
