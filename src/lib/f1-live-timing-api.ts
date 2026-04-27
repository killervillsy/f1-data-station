import type {
  LiveLeaderboardItem,
  LiveSessionSnapshot,
  LiveTelemetrySnapshot,
  LiveTimingSnapshot,
} from "@/types/openf1";

const BASE_URL = "https://livetiming.formula1.com/static";
const liveRevalidate = 10;
const startedSessionsCacheTtl = 60_000;

type F1LiveTimingIndex = {
  Years: Array<{
    Year: number;
    Path: string;
  }>;
};

type F1LiveTimingSeason = {
  Meetings: F1LiveTimingMeeting[];
};

type F1LiveTimingMeeting = {
  Name: string;
  Location: string;
  Country: {
    Name: string;
  };
  Circuit: {
    ShortName: string;
  };
  Sessions: F1LiveTimingSession[];
};

type F1LiveTimingSession = {
  Name: string;
  Type: string;
  StartDate: string;
  EndDate: string;
  GmtOffset: string;
  Path: string;
};

type F1LiveTimingDriver = {
  RacingNumber: string;
  Tla: string;
  BroadcastName: string;
  FullName: string;
  TeamName: string;
  TeamColour: string;
};

type F1LiveTimingDriverList = Record<string, F1LiveTimingDriver>;

type F1LiveTimingLine = {
  Position?: string;
  Line?: number;
  RacingNumber?: string;
  GapToLeader?: string;
  IntervalToPositionAhead?: {
    Value?: string;
  };
  LastLapTime?: {
    Value?: string;
  };
  BestLapTime?: {
    Value?: string;
  };
  NumberOfLaps?: number;
  NumberOfPitStops?: number;
  Status?: number | string;
  Retired?: boolean;
  Stopped?: boolean;
  InPit?: boolean;
  Speeds?: {
    I1?: { Value?: string };
    I2?: { Value?: string };
    ST?: { Value?: string };
    FL?: { Value?: string };
  };
};

type F1LiveTimingData = {
  Lines: Record<string, F1LiveTimingLine>;
};

type LatestSession = {
  meeting: F1LiveTimingMeeting;
  session: F1LiveTimingSession;
};

type StartedSessionsCache = {
  expiresAt: number;
  value: LatestSession[];
};

let startedSessionsCache: StartedSessionsCache | null = null;

async function fetchLiveTiming<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}/${path}`, {
    next: { revalidate: liveRevalidate },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch F1 live timing ${path}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}

function normalizeTeamColor(color: string | undefined): string {
  if (!color) return "#333333";
  return color.startsWith("#") ? color : `#${color}`;
}

function parseSessionDate(session: F1LiveTimingSession, key: "StartDate" | "EndDate") {
  const offset = session.GmtOffset.startsWith("-") || session.GmtOffset.startsWith("+")
    ? session.GmtOffset
    : `+${session.GmtOffset}`;
  const sign = offset.startsWith("-") ? "-" : "+";
  const [hours, minutes] = offset.slice(1).split(":");

  return new Date(`${session[key]}${sign}${hours}:${minutes}`);
}

async function getStartedSessions(): Promise<LatestSession[]> {
  const now = Date.now();

  if (startedSessionsCache && startedSessionsCache.expiresAt > now) {
    return startedSessionsCache.value;
  }

  const index = await fetchLiveTiming<F1LiveTimingIndex>("Index.json");
  const latestYear = index.Years.slice().sort((a, b) => b.Year - a.Year)[0];

  if (!latestYear) return [];

  const season = await fetchLiveTiming<F1LiveTimingSeason>(
    `${latestYear.Path}Index.json`
  );

  const sessions = season.Meetings.flatMap((meeting) =>
    meeting.Sessions.map((session) => ({ meeting, session }))
  )
    .filter(({ session }) => parseSessionDate(session, "StartDate").getTime() <= now)
    .sort(
      (a, b) =>
        parseSessionDate(b.session, "StartDate").getTime() -
        parseSessionDate(a.session, "StartDate").getTime()
    );

  startedSessionsCache = {
    expiresAt: now + startedSessionsCacheTtl,
    value: sessions,
  };

  return sessions;
}

function createSessionSnapshot({
  meeting,
  session,
}: LatestSession): LiveSessionSnapshot {
  return {
    name: meeting.Name || session.Name,
    type: session.Type,
    location: meeting.Location,
    countryName: meeting.Country.Name,
    circuitShortName: meeting.Circuit.ShortName,
    startDate: parseSessionDate(session, "StartDate").toISOString(),
    endDate: parseSessionDate(session, "EndDate").toISOString(),
    source: "F1 Live Timing",
  };
}

function createLeaderboard(
  drivers: F1LiveTimingDriverList,
  timingData: F1LiveTimingData
): LiveLeaderboardItem[] {
  return Object.entries(timingData.Lines)
    .map(([driverNumber, line]) => {
      const driver = drivers[driverNumber];
      const position = Number(line.Position ?? line.Line ?? 0);

      return {
        position,
        driverNumber: Number(line.RacingNumber ?? driverNumber),
        driverCode: driver?.Tla || driverNumber,
        driverName: driver?.FullName || driver?.BroadcastName || `Driver ${driverNumber}`,
        team: driver?.TeamName || "Unknown",
        teamColor: normalizeTeamColor(driver?.TeamColour),
        gapToLeader: line.GapToLeader,
        interval: line.IntervalToPositionAhead?.Value,
        lastLapTime: line.LastLapTime?.Value,
        bestLapTime: line.BestLapTime?.Value,
        laps: line.NumberOfLaps,
        pitStops: line.NumberOfPitStops,
        status: line.Retired
          ? "Retired"
          : line.Stopped
            ? "Stopped"
            : line.InPit
              ? "Pit"
              : line.Status?.toString(),
      };
    })
    .filter((driver) => driver.position > 0)
    .sort((a, b) => a.position - b.position);
}

function createTelemetrySnapshot(
  timingData: F1LiveTimingData,
  driverNumber: number | null
): LiveTelemetrySnapshot | null {
  if (!driverNumber) return null;

  const line = timingData.Lines[String(driverNumber)];
  if (!line) return null;

  return {
    driverNumber,
    speed: null,
    throttle: null,
    brake: null,
    drs: null,
    rpm: null,
    gear: null,
    date: new Date().toISOString(),
    i1Speed: line.Speeds?.I1?.Value,
    i2Speed: line.Speeds?.I2?.Value,
    stSpeed: line.Speeds?.ST?.Value,
    finishLineSpeed: line.Speeds?.FL?.Value,
  };
}

export async function getF1LiveTimingSnapshot(
  driverNumber: number | null
): Promise<LiveTimingSnapshot> {
  try {
    const sessions = await getStartedSessions();

    if (sessions.length === 0) {
      return {
        session: null,
        leaderboard: [],
        telemetry: null,
        updatedAt: new Date().toISOString(),
        error: "F1 官方实时计时索引中暂无已开始的场次",
      };
    }

    for (const latestSession of sessions) {
      try {
        const [drivers, timingData] = await Promise.all([
          fetchLiveTiming<F1LiveTimingDriverList>(
            `${latestSession.session.Path}DriverList.json`
          ),
          fetchLiveTiming<F1LiveTimingData>(
            `${latestSession.session.Path}TimingData.json`
          ),
        ]);

        return {
          session: createSessionSnapshot(latestSession),
          leaderboard: createLeaderboard(drivers, timingData),
          telemetry: createTelemetrySnapshot(timingData, driverNumber),
          updatedAt: new Date().toISOString(),
        };
      } catch {
        continue;
      }
    }

    return {
      session: createSessionSnapshot(sessions[0]),
      leaderboard: [],
      telemetry: null,
      updatedAt: new Date().toISOString(),
      error: `F1 官方实时计时已找到 ${sessions.length} 个场次，但车手列表或计时数据暂不可用`,
    };
  } catch {
    return {
      session: null,
      leaderboard: [],
      telemetry: null,
      updatedAt: new Date().toISOString(),
      error: "F1 官方实时计时数据加载失败",
    };
  }
}
