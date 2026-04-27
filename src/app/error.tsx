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
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-f1-red/20 mb-8">
        <span className="text-2xl font-black text-f1-red">错误</span>
      </div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">数据加载失败</h1>
      <p className="text-text-muted text-lg mb-8">
        上游数据源暂时不可用，或当前页面数据尚未发布。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-f1-red hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          重试
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:border-f1-red text-text-secondary hover:text-text-primary rounded-lg font-medium transition-colors"
        >
          返回首页
        </Link>
        <Link
          href="/schedule"
          className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:border-f1-red text-text-secondary hover:text-text-primary rounded-lg font-medium transition-colors"
        >
          查看赛程
        </Link>
      </div>
    </div>
  );
}
