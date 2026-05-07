import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";

import { GET } from "./route";

function mockFetch(t: TestContext, fetchMock: typeof globalThis.fetch) {
  const originalFetch = globalThis.fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = fetchMock;
}

test("GET returns live snapshots with no-store cache headers", async (t) => {
  mockFetch(t, async () => Response.json({ Years: [] }));

  const response = await GET(new Request("http://localhost/api/live"));

  assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
});
