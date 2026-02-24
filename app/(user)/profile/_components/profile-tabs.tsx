"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { motion } from "motion/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateProfileForm } from "./update-profile-form";
import { MainTab } from "./main-tab";

const tabs = [
  {
    name: "Profile",
    value: "profile",
    content: <MainTab />,
  },
  {
    name: "Update Profile",
    value: "update-profile",
    content: <UpdateProfileForm />,
  },
  {
    name: "Surprise Me",
    value: "surprise",
    content: (
      <>
        <span className="text-foreground font-semibold">Surprise!</span>{" "}
        Here&apos;s something unexpected—a fun fact, a quirky tip, or a daily
        challenge. Come back for a new surprise every day!
      </>
    ),
  },
];

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState("update-profile");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;

      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full max-w-5xl mb-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-8">
        <TabsList className="bg-background relative rounded-none border-b p-0">
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              className="bg-background cursor-pointer dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:shadow-none"
            >
              {tab.name}
            </TabsTrigger>
          ))}

          <motion.div
            className="bg-primary absolute bottom-0 z-20 h-0.5"
            layoutId="underline"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
            }}
          />
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
