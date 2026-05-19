"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { Peg } from "@bprogress/next";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      options={{ showSpinner: false, trickleSpeed: 300 }}
      height="4px"
      shallowRouting
      color="var(--primary)"
    >
      <Peg />
      {children}
    </ProgressProvider>
  );
};

export default Providers;
