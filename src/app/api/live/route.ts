import { getF1LiveTimingSnapshot } from "@/lib/f1-live-timing-api";
import {
  translateCircuitName,
  translateConstructorName,
  translateCountry,
  translateDriverFullName,
  translateLiveStatus,
  translateLocality,
  translateRaceName,
  translateSource,
} from "@/lib/translations";
import type { LiveTimingSnapshot } from "@/types/openf1";

export const dynamic = "force-dynamic";

function localizeSession(
  session: LiveTimingSnapshot["session"]
): LiveTimingSnapshot["session"] {
  if (!session) return null;

  return {
    ...session,
    name: translateRaceName(session.name),
    type: translateSessionType(session.type),
    location: translateLocality(session.location),
    countryName: translateCountry(session.countryName),
    circuitShortName: translateCircuitName(session.circuitShortName),
    source: translateSource(session.source),
  };
}

function translateSessionType(type: string): string {
  const sessionTypeTranslations: Record<string, string> = {
    Practice: "练习赛",
    "Practice 1": "第一次练习赛",
    "Practice 2": "第二次练习赛",
    "Practice 3": "第三次练习赛",
    "First Practice": "第一次练习赛",
    "Second Practice": "第二次练习赛",
    "Third Practice": "第三次练习赛",
    Qualifying: "排位赛",
    Race: "正赛",
    Sprint: "冲刺赛",
    "Sprint Qualifying": "冲刺排位赛",
    "Sprint Shootout": "冲刺排位赛",
    Testing: "测试",
  };

  return sessionTypeTranslations[type] ?? type;
}

function translateLiveGap(value: string): string {
  return value
    .replace(/\bLAPS\b/gi, "圈")
    .replace(/\bLAP\b/gi, "圈");
}

function translateDriverDisplayName(name: string, driverNumber: number): string {
  return name.startsWith("Driver ")
    ? `车手 ${driverNumber}`
    : translateDriverFullName(name);
}

function translateTeamDisplayName(name: string): string {
  return name === "Unknown" ? "未知车队" : translateConstructorName(name);
}

function localizeLeaderboardItem(
  driver: LiveTimingSnapshot["leaderboard"][number]
): LiveTimingSnapshot["leaderboard"][number] {
  return {
    ...driver,
    driverName: translateDriverDisplayName(driver.driverName, driver.driverNumber),
    team: translateTeamDisplayName(driver.team),
    gapToLeader: driver.gapToLeader ? translateLiveGap(driver.gapToLeader) : undefined,
    interval: driver.interval ? translateLiveGap(driver.interval) : undefined,
    status: driver.status ? translateLiveStatus(driver.status) : undefined,
  };
}

function localizeSnapshot(snapshot: LiveTimingSnapshot): LiveTimingSnapshot {
  return {
    session: localizeSession(snapshot.session),
    leaderboard: snapshot.leaderboard.map(localizeLeaderboardItem),
    telemetry: snapshot.telemetry,
    updatedAt: snapshot.updatedAt,
    ...(snapshot.error ? { error: snapshot.error } : {}),
  };
}

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

    return Response.json(localizeSnapshot(snapshot));
  } catch {
    return Response.json(fallbackSnapshot("F1 官方实时计时数据加载失败"));
  }
}
