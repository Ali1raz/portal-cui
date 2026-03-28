"use client";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TextEffect } from "@/components/ui/text-effect";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdmissionsPage() {
  return (
    <main>
      <section className="grid items-center grid-cols-1 gap-10 md:grid-cols-3">
        <div className="space-y-2">
          <TextEffect
            preset="slide"
            speedSegment={0.6}
            as="h3"
            className="text-lg"
          >
            COMSATS University Islamabad
          </TextEffect>
          <TextEffect
            preset="slide"
            speedSegment={0.6}
            as="h1"
            delay={0.3}
            className="font-bold text-primary text-3xl"
          >
            Admissions
          </TextEffect>
        </div>
        <div className="md:col-span-2 space-y-4 *:max-w-xl">
          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={1}
            as="p"
            className="text-muted-foreground"
          >
            COMSATS University Islamabad (CUI), a leading Degree Awarding
            Institution of higher education in Pakistan, is among the Centers of
            Excellence of Commission on Science and Technology for Sustainable
            Development in the South (COMSATS).
          </TextEffect>{" "}
          <div className="flex items-center gap-4">
            <motion.a
              variants={variants}
              initial="hidden"
              animate="visible"
              href="/about"
              className={buttonVariants({
                size: "sm",
                variant: "outline",
                className: "flex group items-center px-8 gap-2",
              })}
            >
              About
              <ArrowRight className="group-hover:translate-x-1 size-4 transition-transform duration-75" />
            </motion.a>
            <motion.a
              variants={variants}
              initial="hidden"
              animate="visible"
              href="/apply"
              className={buttonVariants({
                size: "sm",
                className: "flex group items-center px-8 gap-2",
              })}
            >
              Apply
              <ArrowRight className="group-hover:translate-x-1 size-4 transition-transform duration-75" />
            </motion.a>
          </div>
        </div>
      </section>

      <Separator className="my-14 border" />

      <section className="w-full"></section>
    </main>
  );
}
