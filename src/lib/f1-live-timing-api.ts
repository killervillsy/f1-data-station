import type {
  LiveLeaderboardItem,
  LiveSessionSnapshot,
  LiveTelemetrySnapshot,
  LiveTimingSnapshot,
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Position,
  OpenF1Session,
} from "@/types/openf1";

const BASE_URL = "https://livetiming.formula1.com/static";
const OPENF1_BASE_URL = "https://api.openf1.org/v1";
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

async function fetchOpenF1<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${OPENF1_BASE_URL}${endpoint}`, {
    next: { revalidate: liveRevalidate },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenF1 ${endpoint}: ${response.status} ${response.statusText}`
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

async function getStartedSessions(now = Date.now()): Promise<LatestSession[]> {
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

function getLatestSessionStartTime(sessions: LatestSession[]): number {
  return sessions[0]
    ? parseSessionDate(sessions[0].session, "StartDate").getTime()
    : 0;
}

function createSessionSnapshot({
  meeting,
  session,
}: LatestSession): LiveSessionSnapshot {
  return {
    name: meeting.Name || session.Name,
    type: session.Name || session.Type,
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

function formatOpenF1LapDuration(duration: number | null | undefined): string | undefined {
  if (!duration) return undefined;

  const minutes = Math.floor(duration / 60);
  const seconds = duration - minutes * 60;

  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

function formatOpenF1LapGap(duration: number | null | undefined): string | undefined {
  if (!duration) return undefined;

  return `+${duration.toFixed(3)}`;
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

function createOpenF1SessionSnapshot(session: OpenF1Session): LiveSessionSnapshot {
  return {
    name: session.location,
    type: session.session_name || session.session_type,
    location: session.location,
    countryName: session.country_name,
    circuitShortName: session.circuit_short_name,
    startDate: session.date_start,
    endDate: session.date_end,
    source: "OpenF1",
  };
}

function createOpenF1Leaderboard(
  drivers: OpenF1Driver[],
  positions: OpenF1Position[],
  laps: OpenF1Lap[]
): LiveLeaderboardItem[] {
  const driversByNumber = new Map(
    drivers.map((driver) => [driver.driver_number, driver])
  );
  const latestPositions = new Map<number, OpenF1Position>();
  const latestLaps = new Map<number, OpenF1Lap>();

  for (const position of positions) {
    const existing = latestPositions.get(position.driver_number);
    if (!existing || new Date(position.date) > new Date(existing.date)) {
      latestPositions.set(position.driver_number, position);
    }
  }

  for (const lap of laps) {
    const existing = latestLaps.get(lap.driver_number);
    if (!existing || lap.lap_number > existing.lap_number) {
      latestLaps.set(lap.driver_number, lap);
    }
  }

  const orderedPositions = Array.from(latestPositions.values()).sort(
    (a, b) => a.position - b.position
  );
  const leaderLapDuration = latestLaps.get(
    orderedPositions[0]?.driver_number
  )?.lap_duration;

  return orderedPositions.map((position, index) => {
    const driver = driversByNumber.get(position.driver_number);
    const lap = latestLaps.get(position.driver_number);
    const previousLap = latestLaps.get(orderedPositions[index - 1]?.driver_number);
    const gapToLeader =
      index === 0
        ? formatOpenF1LapDuration(lap?.lap_duration)
        : formatOpenF1LapGap(
            lap?.lap_duration && leaderLapDuration
              ? lap.lap_duration - leaderLapDuration
              : undefined
          );
    const interval = formatOpenF1LapGap(
      lap?.lap_duration && previousLap?.lap_duration
        ? lap.lap_duration - previousLap.lap_duration
        : undefined
    );

    return {
      position: position.position,
      driverNumber: position.driver_number,
      driverCode: driver?.name_acronym || String(position.driver_number),
      driverName: driver?.full_name || driver?.broadcast_name || `Driver ${position.driver_number}`,
      team: driver?.team_name || "Unknown",
      teamColor: normalizeTeamColor(driver?.team_colour),
      ...(gapToLeader ? { gapToLeader } : {}),
      ...(interval ? { interval } : {}),
      laps: lap?.lap_number,
      lastLapTime: formatOpenF1LapDuration(lap?.lap_duration),
    };
  });
}

async function getOpenF1Snapshot(
  driverNumber: number | null,
  now: Date,
  afterTime = 0
): Promise<LiveTimingSnapshot | null> {
  const sessions = await fetchOpenF1<OpenF1Session[]>(`/sessions?year=${now.getUTCFullYear()}`);
  const startedSessions = sessions
    .filter((session) => {
      const startTime = new Date(session.date_start).getTime();
      return startTime <= now.getTime() && startTime > afterTime;
    })
    .sort(
      (a, b) =>
        new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );

  for (const session of startedSessions) {
    const [drivers, positions] = await Promise.all([
      fetchOpenF1<OpenF1Driver[]>(`/drivers?session_key=${session.session_key}`),
      fetchOpenF1<OpenF1Position[]>(`/position?session_key=${session.session_key}`),
    ]);

    if (positions.length === 0) continue;

    const laps = await fetchOpenF1<OpenF1Lap[]>(`/laps?session_key=${session.session_key}`);
    const leaderboard = createOpenF1Leaderboard(drivers, positions, laps);

    if (leaderboard.length === 0) continue;

    const selectedDriverNumber = driverNumber ?? leaderboard[0].driverNumber;
    const selectedLap = laps
      .filter((lap) => lap.driver_number === selectedDriverNumber)
      .sort((a, b) => b.lap_number - a.lap_number)[0];

    return {
      session: createOpenF1SessionSnapshot(session),
      leaderboard,
      telemetry: selectedLap
        ? {
            driverNumber: selectedDriverNumber,
            speed: null,
            throttle: null,
            brake: null,
            drs: null,
            rpm: null,
            gear: null,
            date: selectedLap.date_start,
            i1Speed: selectedLap.i1_speed?.toString(),
            i2Speed: selectedLap.i2_speed?.toString(),
            stSpeed: selectedLap.st_speed?.toString(),
          }
        : null,
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}

export async function getF1LiveTimingSnapshot(
  driverNumber: number | null,
  now = new Date()
): Promise<LiveTimingSnapshot> {
  try {
    const sessions = await getStartedSessions(now.getTime());
    const openF1Snapshot = await getOpenF1Snapshot(
      driverNumber,
      now,
      getLatestSessionStartTime(sessions)
    ).catch(() => null);

    if (openF1Snapshot) return openF1Snapshot;

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
