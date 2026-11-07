import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { REVIEW_STATUS_LABELS } from "@/config/site";
import { formatDate } from "@/lib/format";
import { Card, PageTitle, ReviewStatusBadge } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/ActionButton";
import { Stars } from "@/components/ui/Stars";
import { deleteReview, setReviewStatus } from "../../actions";
import type { ReviewStatus } from "@/types";

interface AdminReview {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  created_at: string;
  published_at: string | null;
}

export default async function ReviewsAdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const statuses = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
  const status: ReviewStatus = statuses.includes(sp.status as ReviewStatus) ? (sp.status as ReviewStatus) : "pending";

  const [{ data }, ...counts] = await Promise.all([
    supabase.from("reviews").select("*").eq("status", status).order("created_at", { ascending: false }).limit(100),
    ...statuses.map((s) => supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", s)),
  ]);
  const reviews = (data ?? []) as AdminReview[];

  return (
    <>
      <PageTitle title="Отзывы" />
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {statuses.map((s, i) => (
          <Link key={s} href={`/admin/reviews?status=${s}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${s === status ? "bg-cream text-coffee" : "border border-cream/15 text-cream/70"}`}>
            {REVIEW_STATUS_LABELS[s]} <span className="opacity-60">{counts[i].count ?? 0}</span>
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <Card><p className="text-cream/50">Здесь пусто.</p></Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{r.author_name}</p>
                  <p className="text-xs text-cream/45">{formatDate(r.created_at, true)}</p>
                </div>
                <div className="flex items-center gap-3"><Stars value={r.rating} size={14} /><ReviewStatusBadge status={r.status} /></div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/80">{r.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && <ActionButton variant="primary" action={setReviewStatus.bind(null, r.id, "approved")}>Опубликовать</ActionButton>}
                {r.status === "pending" && <ActionButton action={setReviewStatus.bind(null, r.id, "rejected")}>Отклонить</ActionButton>}
                {r.status === "approved" && <ActionButton action={setReviewStatus.bind(null, r.id, "hidden")}>Скрыть</ActionButton>}
                <ActionButton variant="danger" confirm="Удалить отзыв навсегда?" action={deleteReview.bind(null, r.id)}>Удалить</ActionButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
