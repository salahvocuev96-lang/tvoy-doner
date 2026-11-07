"use client";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleProduct } from "@/app/admin/actions";

export function ProductToggle({ id, field, value, on, off }: { id: string; field: "is_active" | "is_available" | "is_featured"; value: boolean; on: string; off: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(value);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          const r = await toggleProduct(id, field, !value);
          if (!r.ok) alert(r.error);
          router.refresh();
        })
      }
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${optimistic ? "bg-olive text-cream" : "bg-cream/10 text-cream/50"} ${pending ? "opacity-60" : ""}`}
      aria-pressed={optimistic}
    >
      {optimistic ? on : off}
    </button>
  );
}
