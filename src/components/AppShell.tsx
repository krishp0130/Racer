import { AppNavigation } from "@/components/AppNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)] md:flex-row">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,var(--accent-soft),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--background)_100%)]" />
      </div>
      <AppNavigation />
      <main className="relative z-0 flex min-h-dvh min-w-0 flex-1 flex-col pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:ml-64 md:pb-8">
        {children}
      </main>
    </div>
  );
}
