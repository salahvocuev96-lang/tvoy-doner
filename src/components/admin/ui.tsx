import { ORDER_STATUS_LABELS, REVIEW_STATUS_LABELS } from "@/config/site";
import type { OrderStatus, ReviewStatus } from "@/types";

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-cream/10 bg-coffee-800/70 p-5 ${className}`}>{children}</div>;
}

const ORDER_COLORS: Record<OrderStatus, string> = {
  new: "bg-terracotta text-cream",
  accepted: "bg-gold text-coffee",
  preparing: "bg-gold-600 text-cream",
  ready: "bg-olive text-cream",
  completed: "bg-cream/15 text-cream/80",
  cancelled: "bg-coffee-600 text-cream/50 line-through",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${ORDER_COLORS[status]}`}>{ORDER_STATUS_LABELS[status]}</span>;
}

const REVIEW_COLORS: Record<ReviewStatus, string> = {
  pending: "bg-terracotta text-cream",
  approved: "bg-olive text-cream",
  rejected: "bg-coffee-600 text-cream/60",
  hidden: "bg-cream/15 text-cream/70",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${REVIEW_COLORS[status]}`}>{REVIEW_STATUS_LABELS[status]}</span>;
}

export const inputCls =
  "w-full rounded-xl border border-cream/12 bg-coffee-900/70 px-3.5 py-2.5 text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none";
