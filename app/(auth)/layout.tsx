export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="flex flex-col max-w-5xl mx-auto">{children}</main>;
}
