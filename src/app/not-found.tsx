import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-2 py-8 text-center sm:px-3">
      <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-f1-red/20">
        <span className="text-2xl font-black text-f1-red">404</span>
      </div>
      <h1 className="mb-2 text-xl font-bold text-text-primary">页面未找到</h1>
      <p className="mb-4 text-sm text-text-muted">
        该页面可能不存在，或当前数据源暂未提供对应内容。
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md bg-f1-red px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
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
