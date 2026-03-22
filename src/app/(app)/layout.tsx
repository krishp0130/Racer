import { AppShell } from "@/components/AppShell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </AppShell>
  );
}
