import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <SiteHeader />
      <main className="min-w-0 flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
