import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import ExternalNewsLink from "./ExternalNewsLink";
import { fetchF1News, type NewsResult } from "@/lib/news-api";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export const metadata: Metadata = {
  title: "F1 资讯",
  description: "汇总 Formula 1 最新报道、围场动态、赛事新闻和车队车手资讯。",
  alternates: { canonical: "/news" },
};

async function getNews(): Promise<NewsResult> {
  return fetchF1News();
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3">
      <PageHeader
        title="F1 资讯"
        description="汇总 Formula 1 最新报道、围场动态与比赛相关新闻。"
      >
        {news.ok && news.articles.length > 0 ? (
          <p className="text-xs text-text-subtle">共 {news.articles.length} 条</p>
        ) : null}
      </PageHeader>

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
        <ExternalNewsLink
          key={article.url}
          article={article}
          formattedPublishedAt={formatPublishedAt(article.publishedAt)}
        />
      ))}
    </section>
  );
}

function NewsError({ message }: { message: string }) {
  return <EmptyState message={message} />;
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
