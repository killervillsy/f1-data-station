"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { NewsArticle } from "@/lib/news-api";

export default function ExternalNewsLink({
  article,
  formattedPublishedAt,
}: {
  article: NewsArticle;
  formattedPublishedAt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [isCopying, setIsCopying] = useState(false);
  const copyLockRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  function closeDialog() {
    setIsOpen(false);
    setCopyStatus("idle");
    setIsCopying(false);
    copyLockRef.current = false;
  }

  async function copyUrl() {
    if (copyLockRef.current) return;

    copyLockRef.current = true;
    setIsCopying(true);
    const copied = await copyText(article.url);
    setCopyStatus(copied ? "copied" : "failed");
    setIsCopying(false);
  }

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
          onClick={() => closeDialog()}
          onWheel={(event) => event.preventDefault()}
          onTouchMove={(event) => event.preventDefault()}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/30"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border bg-surface-muted px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-f1-red">
                F1.Data
              </p>
              <h3 id={titleId} className="mt-1 text-base font-bold text-text-primary">
                即将跳转到外部网页
              </h3>
            </div>
            <div className="space-y-3 px-4 py-4">
              <p id={descriptionId} className="text-sm leading-6 text-text-secondary">
                你将离开 F1.Data，前往第三方资讯来源阅读原文。请确认目标网站后继续访问。
              </p>
              <button
                type="button"
                onClick={copyUrl}
                className={`w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-left text-xs leading-5 text-text-muted transition-all duration-200 hover:border-f1-red/50 hover:bg-hover-surface active:scale-[0.99] ${
                  copyStatus === "copied"
                    ? "border-f1-red/60 shadow-[0_0_0_3px_rgb(225_6_0_/_0.12)]"
                    : "border-border"
                }`}
                aria-label="复制外部网页链接"
                aria-busy={isCopying}
              >
                <span className="flex items-center justify-between gap-3 font-semibold text-text-secondary">
                  <span>{article.source}</span>
                  <span className="shrink-0 text-[11px] font-bold text-f1-red">
                    {copyStatus === "copied"
                      ? "已复制"
                      : copyStatus === "failed"
                        ? "长按复制"
                        : "点击复制"}
                  </span>
                </span>
                <span className="mt-1 block break-all">{article.url}</span>
              </button>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => closeDialog()}
                className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-hover-surface hover:text-text-primary"
              >
                取消
              </button>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer rounded-md bg-f1-red px-4 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
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

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const copied = document.execCommand("copy");
    textArea.remove();
    return copied;
  } catch {
    return false;
  }
}
