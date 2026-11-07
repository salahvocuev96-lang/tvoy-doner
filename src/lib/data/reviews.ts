import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Review, ReviewSummary } from "@/types";
import { CACHE_TAGS } from "./tags";

/** Только опубликованные (одобренные) отзывы. */
export async function getPublishedReviews(): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.reviews);

  const empty = { reviews: [], summary: { count: 0, average: 0 } };
  const supabase = createPublicClient();
  if (!supabase) return empty;

  const [list, summary] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, author_name, rating, body, published_at")
      .eq("status", "approved")
      .order("published_at", { ascending: false })
      .limit(24),
    supabase.rpc("review_summary"),
  ]);

  if (list.error || summary.error) {
    console.error("[reviews]", list.error?.message ?? summary.error?.message);
    return empty;
  }
  const s = summary.data as { count: number; average: number };
  return { reviews: list.data as Review[], summary: { count: Number(s.count), average: Number(s.average) } };
}
