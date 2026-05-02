import { getF1LiveTimingSnapshot } from "@/lib/f1-live-timing-api";
import { localizeLiveTimingSnapshot } from "@/lib/live-snapshot-localization";
import type { LiveTimingSnapshot } from "@/types/openf1";

export const dynamic = "force-dynamic";

function fallbackSnapshot(error?: string): LiveTimingSnapshot {
  return {
    session: null,
    leaderboard: [],
    telemetry: null,
    updatedAt: new Date().toISOString(),
    ...(error ? { error } : {}),
  };
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
    const snapshot = await getF1LiveTimingSnapshot(driverNumber);

    return Response.json(localizeLiveTimingSnapshot(snapshot));
  } catch {
    return Response.json(fallbackSnapshot("F1 官方实时计时数据加载失败"));
  }
}
