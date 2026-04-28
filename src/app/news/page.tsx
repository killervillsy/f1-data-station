import { fetchF1News, type NewsResult } from "@/lib/news-api";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

async function getNews(): Promise<NewsResult> {
  return fetchF1News();
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-5">
      <section className="mb-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-5 md:p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-f1-red">
            F1 News
          </p>
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            资讯
          </h1>
          <p className="mt-3 max-w-2xl text-text-muted">
            汇总 Formula 1 最新报道、围场动态与比赛相关新闻，点击卡片可跳转原文阅读。
          </p>
        </div>
      </section>

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
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {news.articles.map((article) => (
        <article
          key={article.url}
          className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-f1-red hover:bg-hover-surface"
        >
          {article.imageUrl && (
            <div className="aspect-video overflow-hidden bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
              <span className="rounded-full bg-selected-surface px-2 py-1 font-semibold text-f1-red">
                {article.source}
              </span>
              <time dateTime={article.publishedAt}>
                {formatPublishedAt(article.publishedAt)}
              </time>
            </div>
            <h2 className="text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-f1-red">
              {article.title}
            </h2>
            {article.description && (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-muted">
                {article.description}
              </p>
            )}
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex pt-4 text-sm font-semibold text-f1-red hover:text-red-700"
            >
              阅读原文
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}

function NewsError({ message }: { message: string }) {
  return <EmptyState message={message} />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-muted">
      {message}
    </div>
  );
}

function getErrorMessage(
  error: Exclude<NewsResult, { ok: true }>["error"],
): string {
  if (error === "NEWS_API_KEY_MISSING") {
    return "未配置 NEWS_API_KEY，暂时无法加载资讯。";
  }

  return "资讯加载失败，请稍后再试。";
}

function formatPublishedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "发布时间未知";

  return format(date, "MM月dd日 HH:mm", { locale: zhCN });
}
