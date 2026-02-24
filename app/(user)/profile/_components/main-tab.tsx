import { Suspense } from "react";

export async function MainTabWrapper() {
  await new Promise((res) => setTimeout(res, 300));
  return <section>osidac</section>;
}

export function MainTab() {
  return (
    <Suspense fallback={<Loading />}>
      <MainTabWrapper />
    </Suspense>
  );
}

export function Loading() {
  return <section>Loading...</section>;
}
