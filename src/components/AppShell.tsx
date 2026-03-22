import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,var(--accent-soft),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--background)_100%)]" />
      </div>
      <main className="relative z-0 flex min-h-0 flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
