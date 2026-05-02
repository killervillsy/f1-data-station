import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import {
  createNewsApiMissingKeyResult,
  fetchF1News,
  normalizeNewsApiPayload,
  normalizeRssFeed,
  type NewsApiEverythingResponse,
} from "./news-api";

const rssFeed = [{ source: "Test RSS", url: "https://example.com/rss.xml" }];

function mockFetch(t: TestContext, fetchMock: typeof globalThis.fetch) {
  const originalFetch = globalThis.fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = fetchMock;
}

test("normalizeNewsApiPayload returns normalized articles", () => {
  const payload: NewsApiEverythingResponse = {
    status: "ok",
    totalResults: 1,
    articles: [
      {
        source: { id: "autosport", name: "Autosport" },
        author: "Reporter",
        title: "Formula 1 title",
        description: "Race weekend preview",
        url: "https://example.com/f1-preview",
        urlToImage: "https://example.com/image.jpg",
        publishedAt: "2026-04-28T10:00:00Z",
        content: "Full content",
      },
    ],
  };

  assert.deepEqual(normalizeNewsApiPayload(payload), {
    ok: true,
    articles: [
      {
        title: "Formula 1 title",
        description: "Race weekend preview",
        url: "https://example.com/f1-preview",
        source: "Autosport",
        publishedAt: "2026-04-28T10:00:00Z",
        imageUrl: "https://example.com/image.jpg",
      },
    ],
  });
});

test("normalizeNewsApiPayload skips articles without title or url and omits missing optional fields", () => {
  const payload: NewsApiEverythingResponse = {
    status: "ok",
    totalResults: 3,
    articles: [
      {
        source: { id: null, name: "BBC Sport" },
        author: null,
        title: "F1 qualifying report",
        description: null,
        url: "https://example.com/qualifying",
        urlToImage: null,
        publishedAt: "2026-04-28T11:00:00Z",
        content: null,
      },
      {
        source: { id: null, name: "No URL" },
        author: null,
        title: "Missing url",
        description: "Skipped",
        url: "",
        urlToImage: null,
        publishedAt: "2026-04-28T12:00:00Z",
        content: null,
      },
      {
        source: { id: null, name: "No Title" },
        author: null,
        title: "",
        description: "Skipped",
        url: "https://example.com/no-title",
        urlToImage: null,
        publishedAt: "2026-04-28T13:00:00Z",
        content: null,
      },
    ],
  };

  assert.deepEqual(normalizeNewsApiPayload(payload), {
    ok: true,
    articles: [
      {
        title: "F1 qualifying report",
        url: "https://example.com/qualifying",
        source: "BBC Sport",
        publishedAt: "2026-04-28T11:00:00Z",
      },
    ],
  });
});

test("normalizeNewsApiPayload returns stable error shape for upstream errors", () => {
  const payload: NewsApiEverythingResponse = {
    status: "error",
    code: "rateLimited",
    message: "You have made too many requests recently.",
  };

  assert.deepEqual(normalizeNewsApiPayload(payload), {
    ok: false,
    error: "NEWS_API_ERROR",
    message: "You have made too many requests recently.",
  });
});

test("createNewsApiMissingKeyResult returns stable missing key error", () => {
  assert.deepEqual(createNewsApiMissingKeyResult(), {
    ok: false,
    error: "NEWS_API_KEY_MISSING",
    message: "NEWS_API_KEY is not configured.",
  });
});

test("normalizeRssFeed parses RSS items and cleans article fields", () => {
  const xml = `<?xml version="1.0"?>
    <rss><channel>
      <item>
        <title><![CDATA[Formula 1 &amp; sprint preview]]></title>
        <link>https://example.com/f1-rss</link>
        <description><![CDATA[<p>Race &amp; qualifying update</p>]]></description>
        <pubDate>Tue, 28 Apr 2026 10:00:00 GMT</pubDate>
        <media:content url="https://example.com/image.jpg" />
      </item>
      <item>
        <title>Missing link</title>
      </item>
    </channel></rss>`;

  assert.deepEqual(normalizeRssFeed(xml, "Formula 1"), [
    {
      title: "Formula 1 & sprint preview",
      description: "Race & qualifying update",
      url: "https://example.com/f1-rss",
      source: "Formula 1",
      publishedAt: "2026-04-28T10:00:00.000Z",
      imageUrl: "https://example.com/image.jpg",
    },
  ]);
});

test("normalizeRssFeed drops non-web links and images", () => {
  const xml = `<?xml version="1.0"?>
    <rss><channel>
      <item>
        <title>Unsafe link</title>
        <link>javascript:alert(1)</link>
      </item>
      <item>
        <title>Safe link with unsafe image</title>
        <link>https://example.com/safe</link>
        <media:content url="data:image/svg+xml;base64,abc" />
      </item>
    </channel></rss>`;

  assert.deepEqual(normalizeRssFeed(xml, "Formula 1"), [
    {
      title: "Safe link with unsafe image",
      url: "https://example.com/safe",
      source: "Formula 1",
      publishedAt: "",
    },
  ]);
});

test("normalizeRssFeed parses Atom entries", () => {
  const xml = `<?xml version="1.0"?>
    <feed>
      <entry>
        <title>F1 atom headline</title>
        <link href="https://example.com/atom" />
        <summary>Atom summary</summary>
        <updated>2026-04-28T12:00:00Z</updated>
      </entry>
    </feed>`;

  assert.deepEqual(normalizeRssFeed(xml, "Atom Source"), [
    {
      title: "F1 atom headline",
      description: "Atom summary",
      url: "https://example.com/atom",
      source: "Atom Source",
      publishedAt: "2026-04-28T12:00:00.000Z",
    },
  ]);
});

test("fetchF1News returns RSS articles first without a NewsAPI key", async (t) => {
  const urls: string[] = [];

  mockFetch(t, async (input) => {
    urls.push(String(input));

    return new Response(
      `<rss><channel><item><title>RSS headline</title><link>https://example.com/rss</link><pubDate>Tue, 28 Apr 2026 09:00:00 GMT</pubDate></item></channel></rss>`,
      { status: 200 },
    );
  });

  assert.deepEqual(await fetchF1News("", { rssFeeds: rssFeed }), {
    ok: true,
    articles: [
      {
        title: "RSS headline",
        url: "https://example.com/rss",
        source: "Test RSS",
        publishedAt: "2026-04-28T09:00:00.000Z",
      },
    ],
  });
  assert.deepEqual(urls, ["https://example.com/rss.xml"]);
});

test("fetchF1News falls back to NewsAPI when RSS fails", async (t) => {
  const urls: string[] = [];

  mockFetch(t, async (input, init) => {
    const url = String(input);
    urls.push(url);

    if (url === "https://example.com/rss.xml") {
      return new Response("not found", { status: 404 });
    }

    assert.match(url, /newsapi\.org\/v2\/everything/);
    assert.match(url, /language=en/);
    assert.match(url, /sortBy=publishedAt/);
    assert.match(url, /pageSize=12/);
    assert.doesNotMatch(url, /apiKey=/);
    assert.equal(new Headers(init?.headers).get("X-Api-Key"), "test-key");

    return new Response(
      JSON.stringify({
        status: "ok",
        totalResults: 1,
        articles: [
          {
            source: { id: "the-race", name: "The Race" },
            author: "Reporter",
            title: "F1 news headline",
            description: "A paddock update",
            url: "https://example.com/f1-news",
            urlToImage: "https://example.com/f1-news.jpg",
            publishedAt: "2026-04-28T14:00:00Z",
            content: "Full story",
          },
        ],
      } satisfies NewsApiEverythingResponse),
      { status: 200 },
    );
  });

  assert.deepEqual(await fetchF1News("test-key", { rssFeeds: rssFeed }), {
    ok: true,
    articles: [
      {
        title: "F1 news headline",
        description: "A paddock update",
        url: "https://example.com/f1-news",
        source: "The Race",
        publishedAt: "2026-04-28T14:00:00Z",
        imageUrl: "https://example.com/f1-news.jpg",
      },
    ],
  });
  assert.equal(urls.length, 2);
});

test("fetchF1News returns source unavailable when RSS fails without a NewsAPI key", async (t) => {
  mockFetch(t, async () => new Response("not found", { status: 404 }));

  assert.deepEqual(await fetchF1News("", { rssFeeds: rssFeed }), {
    ok: false,
    error: "NEWS_SOURCE_UNAVAILABLE",
    message: "No configured news source returned articles.",
  });
});

test("normalizeRssFeed preserves unknown dates as empty strings", () => {
  assert.deepEqual(
    normalizeRssFeed(
      `<rss><channel><item><title>Undated RSS headline</title><link>https://example.com/undated</link></item></channel></rss>`,
      "Formula 1",
    ),
    [
      {
        title: "Undated RSS headline",
        url: "https://example.com/undated",
        source: "Formula 1",
        publishedAt: "",
      },
    ],
  );
});

test("fetchF1News returns empty RSS result without a NewsAPI key", async (t) => {
  mockFetch(t, async () => new Response("<rss><channel></channel></rss>", { status: 200 }));

  assert.deepEqual(await fetchF1News("", { rssFeeds: rssFeed }), {
    ok: true,
    articles: [],
  });
});

test("fetchF1News aborts slow RSS requests", async (t) => {
  mockFetch(t, async (_input, init) => {
    const signal = init?.signal;

    assert.ok(signal);

    return new Promise<Response>((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    });
  });

  assert.deepEqual(await fetchF1News("", { rssFeeds: rssFeed, timeoutMs: 1 }), {
    ok: false,
    error: "NEWS_SOURCE_UNAVAILABLE",
    message: "No configured news source returned articles.",
  });
});
