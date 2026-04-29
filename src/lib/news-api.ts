export type NewsApiArticle = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

export type NewsApiEverythingResponse =
  | {
      status: "ok";
      totalResults: number;
      articles: NewsApiArticle[];
    }
  | {
      status: "error";
      code?: string;
      message?: string;
    };

export type NewsArticle = {
  title: string;
  description?: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
};

export type NewsResult =
  | {
      ok: true;
      articles: NewsArticle[];
    }
  | {
      ok: false;
      error:
        | "NEWS_SOURCE_UNAVAILABLE"
        | "NEWS_API_KEY_MISSING"
        | "NEWS_API_ERROR"
        | "NEWS_API_REQUEST_FAILED";
      message: string;
    };

type RssFeedConfig = {
  source: string;
  url: string;
};

type FetchF1NewsOptions = {
  timeoutMs?: number;
  rssFeeds?: RssFeedConfig[];
};

const NEWS_API_ENDPOINT = "https://newsapi.org/v2/everything";
const F1_QUERY = '("Formula 1" OR F1) AND racing';
const NEWS_API_TIMEOUT_MS = 5000;
const MAX_NEWS_ARTICLES = 12;
const F1_RSS_FEEDS: RssFeedConfig[] = [
  {
    source: "Formula 1",
    url: "https://www.formula1.com/en/latest/all.xml",
  },
];

export function createNewsApiMissingKeyResult(): NewsResult {
  return {
    ok: false,
    error: "NEWS_API_KEY_MISSING",
    message: "NEWS_API_KEY is not configured.",
  };
}

function createNewsSourceUnavailableResult(): NewsResult {
  return {
    ok: false,
    error: "NEWS_SOURCE_UNAVAILABLE",
    message: "No configured news source returned articles.",
  };
}

export function normalizeNewsApiPayload(payload: NewsApiEverythingResponse): NewsResult {
  if (payload.status === "error") {
    return {
      ok: false,
      error: "NEWS_API_ERROR",
      message: payload.message || "NewsAPI.org returned an error.",
    };
  }

  return {
    ok: true,
    articles: payload.articles.flatMap((article) => {
      if (!article.title || !article.url) return [];

      return [
        {
          title: article.title,
          ...(article.description ? { description: article.description } : {}),
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          ...(article.urlToImage ? { imageUrl: article.urlToImage } : {}),
        },
      ];
    }),
  };
}

export function normalizeRssFeed(xml: string, source: string): NewsArticle[] {
  const items = extractBlocks(xml, "item");
  const entries = items.length > 0 ? items : extractBlocks(xml, "entry");

  return entries.flatMap((entry) => {
    const title = cleanText(extractTagValue(entry, "title"));
    const url = normalizeWebUrl(cleanText(extractTagValue(entry, "link")) || extractAttribute(entry, "link", "href"));
    const publishedAt = cleanText(
      extractTagValue(entry, "pubDate") ||
        extractTagValue(entry, "published") ||
        extractTagValue(entry, "updated"),
    );
    const description = cleanDescription(
      extractTagValue(entry, "description") ||
        extractTagValue(entry, "summary") ||
        extractTagValue(entry, "content:encoded") ||
        extractTagValue(entry, "content"),
    );
    const imageUrl = normalizeWebUrl(
      extractAttribute(entry, "media:content", "url") ||
        extractAttribute(entry, "media:thumbnail", "url") ||
        extractAttribute(entry, "enclosure", "url"),
    );

    if (!title || !url) return [];

    return [
      {
        title,
        ...(description ? { description } : {}),
        url,
        source,
        publishedAt: normalizePublishedAt(publishedAt),
        ...(imageUrl ? { imageUrl } : {}),
      },
    ];
  });
}

export async function fetchF1News(
  apiKey = process.env.NEWS_API_KEY,
  options: FetchF1NewsOptions = {},
): Promise<NewsResult> {
  const rssResult = await fetchRssF1News(options);

  if (rssResult.ok && rssResult.articles.length > 0) return rssResult;
  if (rssResult.ok && !apiKey) return rssResult;
  if (!apiKey) return createNewsSourceUnavailableResult();

  return fetchNewsApiF1News(apiKey, options);
}

async function fetchRssF1News(options: FetchF1NewsOptions): Promise<NewsResult> {
  const feeds = options.rssFeeds ?? F1_RSS_FEEDS;
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? NEWS_API_TIMEOUT_MS);

      try {
        const response = await fetch(feed.url, {
          headers: {
            "User-Agent": "F1.Data News Reader",
          },
          next: { revalidate: 300 },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`RSS request failed with status ${response.status}.`);

        return normalizeRssFeed(await response.text(), feed.source);
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
  const fulfilled = results.filter((result) => result.status === "fulfilled");

  if (fulfilled.length === 0) return createNewsSourceUnavailableResult();

  return {
    ok: true,
    articles: dedupeAndSortArticles(fulfilled.flatMap((result) => result.value)).slice(0, MAX_NEWS_ARTICLES),
  };
}

async function fetchNewsApiF1News(
  apiKey: string,
  options: FetchF1NewsOptions,
): Promise<NewsResult> {
  const params = new URLSearchParams({
    q: F1_QUERY,
    language: "en",
    sortBy: "publishedAt",
    pageSize: String(MAX_NEWS_ARTICLES),
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? NEWS_API_TIMEOUT_MS);

  try {
    const response = await fetch(`${NEWS_API_ENDPOINT}?${params.toString()}`, {
      headers: {
        "X-Api-Key": apiKey,
      },
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    const payload = (await response.json()) as NewsApiEverythingResponse;

    if (!response.ok && payload.status !== "error") {
      return {
        ok: false,
        error: "NEWS_API_REQUEST_FAILED",
        message: `NewsAPI.org request failed with status ${response.status}.`,
      };
    }

    return normalizeNewsApiPayload(payload);
  } catch {
    return {
      ok: false,
      error: "NEWS_API_REQUEST_FAILED",
      message: "NewsAPI.org request failed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractBlocks(xml: string, tagName: string): string[] {
  return [...xml.matchAll(new RegExp(`<${escapeRegExp(tagName)}\\b[\\s\\S]*?<\\/${escapeRegExp(tagName)}>`, "gi"))].map(
    ([match]) => match,
  );
}

function extractTagValue(xml: string, tagName: string): string {
  const match = xml.match(new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(tagName)}>`, "i"));

  return match?.[1] ?? "";
}

function extractAttribute(xml: string, tagName: string, attributeName: string): string {
  const tag = xml.match(new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>`, "i"))?.[0];
  const value = tag?.match(new RegExp(`${escapeRegExp(attributeName)}=["']([^"']+)["']`, "i"))?.[1];

  return value ? decodeXmlEntities(value.trim()) : "";
}

function cleanDescription(value: string): string {
  return cleanText(value).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function cleanText(value: string): string {
  return decodeXmlEntities(stripCdata(value)).trim();
}

function stripCdata(value: string): string {
  return value.replace(/^\s*<!\[CDATA\[([\s\S]*?)]]>\s*$/i, "$1");
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeWebUrl(value: string): string {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizePublishedAt(value: string): string {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function dedupeAndSortArticles(articles: NewsArticle[]): NewsArticle[] {
  const unique = new Map<string, NewsArticle>();

  for (const article of articles) {
    if (!unique.has(article.url)) unique.set(article.url, article);
  }

  return [...unique.values()].sort((left, right) => dateTime(right.publishedAt) - dateTime(left.publishedAt));
}

function dateTime(value: string): number {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
