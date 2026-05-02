import { fetchF1News, type NewsResult } from "@/lib/news-api";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

async function getNews(): Promise<NewsResult> {
  return fetchF1News();
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            F1 资讯
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            汇总 Formula 1 最新报道、围场动态与比赛相关新闻。
          </p>
        </div>
        {news.ok && news.articles.length > 0 ? (
          <p className="text-xs text-text-subtle">共 {news.articles.length} 条</p>
        ) : null}
      </div>

      {news.ok ? (
        <NewsContent news={news} />
      ) : (
        <NewsError message={getErrorMessage(news.error)} />
      )}
    </div>
  );
}

function NewsContent({ news }: { news: Extract<NewsResult, { ok: true }> }) {
  if (news.articles.length === 0) {
    return <EmptyState message="暂无资讯" />;
  }

  return (
    <section className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {news.articles.map((article) => (
        <a
          key={article.url}
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="group flex h-full overflow-hidden rounded-md border border-border bg-surface transition-all hover:border-f1-red/50 hover:bg-hover-surface"
        >
          {article.imageUrl ? (
            <div className="hidden w-32 shrink-0 overflow-hidden bg-surface-muted sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col p-2">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-text-subtle">
              <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium text-text-secondary">
                {article.source}
              </span>
              <time dateTime={article.publishedAt || undefined}>
                {formatPublishedAt(article.publishedAt)}
              </time>
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
        </a>
      ))}
    </section>
  );
}

function NewsError({ message }: { message: string }) {
  return <EmptyState message={message} />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-text-muted">
      {message}
    </div>
  );
}

function getErrorMessage(
  error: Exclude<NewsResult, { ok: true }>["error"],
): string {
  if (error === "NEWS_SOURCE_UNAVAILABLE") {
    return "资讯源暂时不可用，请稍后再试。";
  }

  if (error === "NEWS_API_KEY_MISSING") {
    return "未配置 NEWS_API_KEY，备用资讯源暂时不可用。";
  }

  return "资讯加载失败，请稍后再试。";
}

function formatPublishedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "发布时间未知";

  return format(date, "MM月dd日 HH:mm", { locale: zhCN });
}
