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
      error: "NEWS_API_KEY_MISSING" | "NEWS_API_ERROR" | "NEWS_API_REQUEST_FAILED";
      message: string;
    };

const NEWS_API_ENDPOINT = "https://newsapi.org/v2/everything";
const F1_QUERY = '("Formula 1" OR F1) AND racing';

export function createNewsApiMissingKeyResult(): NewsResult {
  return {
    ok: false,
    error: "NEWS_API_KEY_MISSING",
    message: "NEWS_API_KEY is not configured.",
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

export async function fetchF1News(apiKey = process.env.NEWS_API_KEY): Promise<NewsResult> {
  if (!apiKey) return createNewsApiMissingKeyResult();

  const params = new URLSearchParams({
    q: F1_QUERY,
    language: "en",
    sortBy: "publishedAt",
    pageSize: "12",
    apiKey,
  });

  try {
    const response = await fetch(`${NEWS_API_ENDPOINT}?${params.toString()}`, {
      next: { revalidate: 300 },
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
  }
}
