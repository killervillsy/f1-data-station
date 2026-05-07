import { getF1LiveTimingSnapshot } from "@/lib/f1-live-timing-api";
import { localizeLiveTimingSnapshot } from "@/lib/live-snapshot-localization";
import type { LiveTimingSnapshot } from "@/types/openf1";

export const dynamic = "force-dynamic";

const LIVE_SNAPSHOT_CACHE_TTL_MS = 5_000;
const LIVE_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

const liveSnapshotCache = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<LiveTimingSnapshot>;
  }
>();

function fallbackSnapshot(error?: string): LiveTimingSnapshot {
  return {
    session: null,
    leaderboard: [],
    telemetry: null,
    updatedAt: new Date().toISOString(),
    ...(error ? { error } : {}),
  };
}

function getCachedLiveSnapshot(driverNumber: number | null): Promise<LiveTimingSnapshot> {
  const cacheKey = String(driverNumber ?? "default");
  const cachedSnapshot = liveSnapshotCache.get(cacheKey);

  if (cachedSnapshot && cachedSnapshot.expiresAt > Date.now()) {
    return cachedSnapshot.promise;
  }

  const promise = getF1LiveTimingSnapshot(driverNumber).then((snapshot) =>
    localizeLiveTimingSnapshot(snapshot),
  );

  liveSnapshotCache.set(cacheKey, {
    expiresAt: Date.now() + LIVE_SNAPSHOT_CACHE_TTL_MS,
    promise,
  });

  promise.catch(() => {
    if (liveSnapshotCache.get(cacheKey)?.promise === promise) {
      liveSnapshotCache.delete(cacheKey);
    }
  });

  return promise;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const driverNumberParam = url.searchParams.get("driverNumber");
    const parsedDriverNumber = driverNumberParam ? Number(driverNumberParam) : null;
    const driverNumber =
      parsedDriverNumber &&
      Number.isInteger(parsedDriverNumber) &&
      parsedDriverNumber > 0
        ? parsedDriverNumber
        : null;
    const snapshot = await getCachedLiveSnapshot(driverNumber);

    return Response.json(snapshot, { headers: LIVE_RESPONSE_HEADERS });
  } catch {
    return Response.json(fallbackSnapshot("F1 官方实时计时数据加载失败"), {
      headers: LIVE_RESPONSE_HEADERS,
    });
  }
}
