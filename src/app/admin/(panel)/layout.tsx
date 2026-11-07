import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

async function Gate({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[240px_1fr]">
      <AdminNav email={email} />
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center text-cream/50">Загрузка…</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
