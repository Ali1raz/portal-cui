export default function ClerkLayou({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>header</header>
      <main className="max-w-5xl w-full px-4 md:px-8 py-4 space-y-4 md:space-y-6">
        {children}
      </main>
    </>
  );
}
