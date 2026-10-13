import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { Notice } from "@/components/ui/notice";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1560px] gap-6 px-4 py-5 lg:px-8 lg:py-6">
      <StudentSidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <SiteHeader />
        <Notice tone="warning" title="Demo content">
          Discovery, profile, and ticket pages still show sample records. Login and registration
          controls use the server API; do not treat sample tickets as real reservations.
        </Notice>
        <main className="min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
