"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-2 py-8 text-center sm:px-3">
      <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-f1-red/20">
        <span className="text-xl font-black text-f1-red">错误</span>
      </div>
      <h1 className="mb-2 text-xl font-bold text-text-primary">数据加载失败</h1>
      <p className="mb-4 text-sm text-text-muted">
        上游数据源暂时不可用，或当前页面数据尚未发布。
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 rounded-md bg-f1-red px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
        >
          重试
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-f1-red hover:text-text-primary"
        >
          返回首页
        </Link>
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-f1-red hover:text-text-primary"
        >
          查看赛程
        </Link>
      </div>
    </div>
  );
}
