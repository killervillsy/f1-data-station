"use client";

import { useId, useState } from "react";
import type { NewsArticle } from "@/lib/news-api";

export default function ExternalNewsLink({
  article,
  formattedPublishedAt,
}: {
  article: NewsArticle;
  formattedPublishedAt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex h-full w-full overflow-hidden rounded-md border border-border bg-surface text-left transition-all hover:border-f1-red/50 hover:bg-hover-surface"
      >
        {article.imageUrl ? (
          <div className="hidden w-32 shrink-0 overflow-hidden bg-surface-muted sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col p-2">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-text-subtle">
            <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium text-text-secondary">
              {article.source}
            </span>
            <time dateTime={article.publishedAt || undefined}>{formattedPublishedAt}</time>
          </div>
          <h2 className="break-words text-sm font-bold leading-snug text-text-primary transition-colors group-hover:text-f1-red">
            {article.title}
          </h2>
          {article.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-muted">
              {article.description}
            </p>
          )}
          <span className="mt-auto inline-flex pt-2 text-xs font-semibold text-f1-red">
            阅读原文
          </span>
        </div>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/30"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border bg-surface-muted px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-f1-red">
                External Link
              </p>
              <h3 id={titleId} className="mt-1 text-base font-bold text-text-primary">
                即将跳转到外部网页
              </h3>
            </div>
            <div className="space-y-3 px-4 py-4">
              <p id={descriptionId} className="text-sm leading-6 text-text-secondary">
                你将离开 F1.Data，前往第三方资讯来源阅读原文。请确认目标网站后继续访问。
              </p>
              <div className="rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 text-text-muted">
                <p className="font-semibold text-text-secondary">{article.source}</p>
                <p className="mt-1 break-all">{article.url}</p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-hover-surface hover:text-text-primary"
              >
                取消
              </button>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-f1-red px-4 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                继续访问
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
