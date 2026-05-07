import type {
  MRData,
  Race,
  PitStopTable,
  Driver,
  Constructor,
  DriverStanding,
  ConstructorStanding,
  RaceResult,
  QualifyingResult,
  SprintResult,
} from "@/types/f1";

const BASE_URL = "https://api.jolpi.ca/ergast/f1";

const f1Cache = {
  default: 300,
  current: 300,
  stable: 3_600,
  historical: 86_400,
} as const;

type F1FetchOptions = {
  revalidate?: number;
  tags?: string[];
};

function getSeasonCache(season: string): F1FetchOptions {
  return season === "current" || season === getCurrentSeason()
    ? { revalidate: f1Cache.stable, tags: ["f1:schedule", `f1:season:${season}`] }
    : { revalidate: f1Cache.historical, tags: ["f1:schedule", `f1:season:${season}`] };
}

function getStandingsCache(season: string): F1FetchOptions {
  return season === "current" || season === getCurrentSeason()
    ? { revalidate: f1Cache.current, tags: ["f1:standings", `f1:season:${season}`] }
    : { revalidate: f1Cache.historical, tags: ["f1:standings", `f1:season:${season}`] };
}

async function fetchF1Data<T>(
  endpoint: string,
  options: F1FetchOptions = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}.json`, {
    next: {
      revalidate: options.revalidate ?? f1Cache.default,
      ...(options.tags ? { tags: options.tags } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch F1 data for ${endpoint}: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.MRData;
}

export function getCurrentSeason(): string {
  return String(new Date().getFullYear());
}

export async function getLatestSeason(): Promise<string> {
  const data = await fetchF1Data<MRData>("/current/driverStandings", {
    revalidate: f1Cache.current,
    tags: ["f1:standings", "f1:season:current"],
  });

  return (
    data.StandingsTable?.season ??
    data.StandingsTable?.StandingsLists[0]?.season ??
    getCurrentSeason()
  );
}

export function getRaceDateTime(race: Race): Date {
  return new Date(`${race.date}T${race.time || "23:59:59Z"}`);
}

export function getRaceDisplayDate(
  race: Race,
  format: "long" | "short" = "long",
): string {
  if (!race.time) return formatApiDate(race.date, format);

  const { year, month, day } = getShanghaiDateParts(getRaceDateTime(race));

  return format === "long" ? `${year}年${month}月${day}日` : `${month}月${day}日`;
}

function formatApiDate(date: string, format: "long" | "short") {
  const [year, month, day] = date.split("-");

  return format === "long" ? `${year}年${month}月${day}日` : `${month}月${day}日`;
}

function getShanghaiDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).formatToParts(date);

  return {
    year: parts.find((part) => part.type === "year")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value ?? "",
    day: parts.find((part) => part.type === "day")?.value ?? "",
  };
}

export function getRaceDisplayTime(race: Race): string {
  if (!race.time) return "时间待定";

  return `${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Shanghai",
  }).format(getRaceDateTime(race))}`;
}

export function getRaceResultsFromRace(race: Race | undefined): RaceResult[] {
  return race?.Results || race?.results || [];
}

export type RaceStatus = "completed" | "today" | "upcoming";

const raceDurationMs = 3 * 60 * 60 * 1000;

export function isRaceInProgress(race: Race, now = new Date()): boolean {
  const weekendStartTime = getRaceWeekendStartTime(race);
  const raceTime = getRaceDateTime(race).getTime();
  const currentTime = now.getTime();

  return weekendStartTime <= currentTime && currentTime <= raceTime + raceDurationMs;
}

function getRaceWeekendStartTime(race: Race): number {
  return [
    race.FirstPractice,
    race.SecondPractice,
    race.ThirdPractice,
    race.SprintQualifying,
    race.SprintShootout,
    race.Sprint,
    race.Qualifying,
    race,
  ].reduce((earliest, session) => {
    if (!session?.time) return earliest;

    return Math.min(earliest, new Date(`${session.date}T${session.time}`).getTime());
  }, getRaceDateTime(race).getTime());
}

export function classifyRaceStatus(race: Race, now = new Date()): RaceStatus {
  const raceDateTime = getRaceDateTime(race);
  const raceDay = race.date;
  const today = now.toISOString().slice(0, 10);

  if (raceDateTime.getTime() < now.getTime() - raceDurationMs) {
    return "completed";
  }

  if (raceDay === today || hasSessionOnDate(race, today)) {
    return "today";
  }

  return "upcoming";
}

function hasSessionOnDate(race: Race, date: string): boolean {
  const sessions = [
    race.FirstPractice,
    race.SecondPractice,
    race.ThirdPractice,
    race.SprintQualifying,
    race.SprintShootout,
    race.Sprint,
    race.Qualifying,
  ];

  return sessions.some((session) => session?.date === date);
}

// Get current season races (schedule)
export async function getCurrentSeasonSchedule(): Promise<Race[]> {
  const season = getCurrentSeason();
  const data = await fetchF1Data<MRData>(`/${season}`, getSeasonCache(season));

  return data.RaceTable?.Races || [];
}

// Get specific season schedule
export async function getSeasonSchedule(season: string): Promise<Race[]> {
  const data = await fetchF1Data<MRData>(`/${season}`, getSeasonCache(season));

  return data.RaceTable?.Races || [];
}

// Get race results for a specific race
export async function getRaceResults(
  season: string,
  round: string
): Promise<RaceResult[]> {
  const data = await fetchF1Data<MRData>(`/${season}/${round}/results`, {
    revalidate: season === "current" ? f1Cache.current : f1Cache.historical,
    tags: ["f1:results", `f1:season:${season}`, `f1:round:${round}`],
  });

  return getRaceResultsFromRace(data.RaceTable?.Races[0]);
}

// Get qualifying results
export async function getQualifyingResults(
  season: string,
  round: string
): Promise<QualifyingResult[]> {
  const data = await fetchF1Data<MRData>(`/${season}/${round}/qualifying`, {
    revalidate: season === "current" ? f1Cache.current : f1Cache.historical,
    tags: ["f1:qualifying", `f1:season:${season}`, `f1:round:${round}`],
  });

  return data.RaceTable?.Races[0]?.QualifyingResults || [];
}

export async function getSprintResults(
  season: string,
  round: string
): Promise<SprintResult[]> {
  const data = await fetchF1Data<MRData>(`/${season}/${round}/sprint`, {
    revalidate: season === "current" ? f1Cache.current : f1Cache.historical,
    tags: ["f1:sprint", `f1:season:${season}`, `f1:round:${round}`],
  });

  return data.RaceTable?.Races[0]?.SprintResults || [];
}

// Get driver standings
export async function getDriverStandings(
  season: string = "current"
): Promise<DriverStanding[]> {
  const data = await fetchF1Data<MRData>(
    `/${season}/driverStandings`,
    getStandingsCache(season)
  );

  return data.StandingsTable?.StandingsLists[0]?.DriverStandings || [];
}

// Get constructor standings
export async function getConstructorStandings(
  season: string = "current"
): Promise<ConstructorStanding[]> {
  const data = await fetchF1Data<MRData>(
    `/${season}/constructorStandings`,
    getStandingsCache(season)
  );

  return data.StandingsTable?.StandingsLists[0]?.ConstructorStandings || [];
}

// Get all drivers for a season
export async function getDrivers(season: string = "current"): Promise<Driver[]> {
  const data = await fetchF1Data<MRData>(`/${season}/drivers`, {
    revalidate: season === "current" ? f1Cache.stable : f1Cache.historical,
    tags: ["f1:drivers", `f1:season:${season}`],
  });

  return data.DriverTable?.Drivers || [];
}

export async function getCurrentDriverEntries(): Promise<DriverStanding[]> {
  return getDriverStandings("current");
}

export async function getCurrentConstructorEntries(): Promise<ConstructorStanding[]> {
  return getConstructorStandings("current");
}

// Get specific driver info
export async function getDriver(driverId: string): Promise<Driver | null> {
  const data = await fetchF1Data<MRData>(`/drivers/${driverId}`, {
    revalidate: f1Cache.historical,
    tags: ["f1:drivers", `f1:driver:${driverId}`],
  });

  return data.DriverTable?.Drivers[0] || null;
}

// Get all constructors for a season
export async function getConstructors(
  season: string = "current"
): Promise<Constructor[]> {
  const data = await fetchF1Data<MRData>(`/${season}/constructors`, {
    revalidate: season === "current" ? f1Cache.stable : f1Cache.historical,
    tags: ["f1:constructors", `f1:season:${season}`],
  });

  return data.ConstructorTable?.Constructors || [];
}

// Get specific constructor info
export async function getConstructor(
  constructorId: string
): Promise<Constructor | null> {
  const data = await fetchF1Data<MRData>(`/constructors/${constructorId}`, {
    revalidate: f1Cache.historical,
    tags: ["f1:constructors", `f1:constructor:${constructorId}`],
  });

  return data.ConstructorTable?.Constructors[0] || null;
}

// Get last race results
export async function getLastRaceResults(): Promise<{
  race: Race | null;
  results: RaceResult[];
}> {
  const data = await fetchF1Data<MRData>("/current/last/results", {
    revalidate: f1Cache.current,
    tags: ["f1:results", "f1:last-race", "f1:season:current"],
  });
  const race = data.RaceTable?.Races[0];
  const results = getRaceResultsFromRace(race);

  if (!race) {
    return { race: null, results };
  }

  try {
    const pitStopData = await fetchF1Data<MRData & { RaceTable?: PitStopTable }>(
      `/${race.season}/${race.round}/pitstops`,
      {
        revalidate: f1Cache.current,
        tags: ["f1:pitstops", `f1:season:${race.season}`, `f1:round:${race.round}`],
      }
    );
    const pitStops = pitStopData.RaceTable?.Races[0]?.PitStops ?? [];
    const pitStopCounts = new Map<string, number>();

    pitStops.forEach((pitStop) => {
      pitStopCounts.set(
        pitStop.driverId,
        (pitStopCounts.get(pitStop.driverId) ?? 0) + 1
      );
    });

    return {
      race,
      results: results.map((result) => ({
        ...result,
        pitStops: pitStopCounts.get(result.Driver.driverId),
      })),
    };
  } catch {
    return { race, results };
  }
}

// Get next race
export async function getNextRace(now = new Date()): Promise<Race | null> {
  const season = getCurrentSeason();
  const data = await fetchF1Data<MRData>(`/${season}`, getSeasonCache(season));
  const races = data.RaceTable?.Races || [];

  for (const race of races) {
    if (isRaceInProgress(race, now) || getRaceDateTime(race) > now) {
      return race;
    }
  }

  return null;
}
