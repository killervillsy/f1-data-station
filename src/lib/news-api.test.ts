import assert from "node:assert/strict";
import test from "node:test";
import {
  createNewsApiMissingKeyResult,
  normalizeNewsApiPayload,
  type NewsApiEverythingResponse,
} from "./news-api";

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
