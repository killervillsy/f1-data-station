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
} from "@/types/f1";

const BASE_URL = "https://api.jolpi.ca/ergast/f1";

async function fetchF1Data<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}.json`, {
    next: { revalidate: 300 },
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
  const data = await fetchF1Data<MRData>("/current/driverStandings");

  return (
    data.StandingsTable?.season ??
    data.StandingsTable?.StandingsLists[0]?.season ??
    getCurrentSeason()
  );
}

export function getRaceDateTime(race: Race): Date {
  return new Date(`${race.date}T${race.time || "23:59:59Z"}`);
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

export function classifyRaceStatus(race: Race, now = new Date()): RaceStatus {
  const raceDateTime = getRaceDateTime(race);
  const raceDay = race.date;
  const today = now.toISOString().slice(0, 10);

  if (raceDateTime.getTime() < now.getTime() - 3 * 60 * 60 * 1000) {
    return "completed";
  }

  if (raceDay === today) {
    return "today";
  }

  return "upcoming";
}

// Get current season races (schedule)
export async function getCurrentSeasonSchedule(): Promise<Race[]> {
  const data = await fetchF1Data<MRData>(`/${getCurrentSeason()}`);

  return data.RaceTable?.Races || [];
}

// Get specific season schedule
export async function getSeasonSchedule(season: string): Promise<Race[]> {
  const data = await fetchF1Data<MRData>(`/${season}`);

  return data.RaceTable?.Races || [];
}

// Get race results for a specific race
export async function getRaceResults(
  season: string,
  round: string
): Promise<RaceResult[]> {
  const data = await fetchF1Data<MRData>(`/${season}/${round}/results`);

  return getRaceResultsFromRace(data.RaceTable?.Races[0]);
}

// Get qualifying results
export async function getQualifyingResults(
  season: string,
  round: string
): Promise<QualifyingResult[]> {
  const data = await fetchF1Data<MRData>(`/${season}/${round}/qualifying`);

  return data.RaceTable?.Races[0]?.QualifyingResults || [];
}

// Get driver standings
export async function getDriverStandings(
  season: string = "current"
): Promise<DriverStanding[]> {
  const data = await fetchF1Data<MRData>(`/${season}/driverStandings`);

  return data.StandingsTable?.StandingsLists[0]?.DriverStandings || [];
}

// Get constructor standings
export async function getConstructorStandings(
  season: string = "current"
): Promise<ConstructorStanding[]> {
  const data = await fetchF1Data<MRData>(`/${season}/constructorStandings`);

  return data.StandingsTable?.StandingsLists[0]?.ConstructorStandings || [];
}

// Get all drivers for a season
export async function getDrivers(season: string = "current"): Promise<Driver[]> {
  const data = await fetchF1Data<MRData>(`/${season}/drivers`);

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
  const data = await fetchF1Data<MRData>(`/drivers/${driverId}`);

  return data.DriverTable?.Drivers[0] || null;
}

// Get all constructors for a season
export async function getConstructors(
  season: string = "current"
): Promise<Constructor[]> {
  const data = await fetchF1Data<MRData>(`/${season}/constructors`);

  return data.ConstructorTable?.Constructors || [];
}

// Get specific constructor info
export async function getConstructor(
  constructorId: string
): Promise<Constructor | null> {
  const data = await fetchF1Data<MRData>(`/constructors/${constructorId}`);

  return data.ConstructorTable?.Constructors[0] || null;
}

// Get last race results
export async function getLastRaceResults(): Promise<{
  race: Race | null;
  results: RaceResult[];
}> {
  const data = await fetchF1Data<MRData>("/current/last/results");
  const race = data.RaceTable?.Races[0];
  const results = getRaceResultsFromRace(race);

  if (!race) {
    return { race: null, results };
  }

  try {
    const pitStopData = await fetchF1Data<MRData & { RaceTable?: PitStopTable }>(
      `/${race.season}/${race.round}/pitstops`
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
export async function getNextRace(): Promise<Race | null> {
  const data = await fetchF1Data<MRData>(`/${getCurrentSeason()}`);
  const races = data.RaceTable?.Races || [];

  const now = new Date();
  for (const race of races) {
    if (getRaceDateTime(race) > now) {
      return race;
    }
  }

  return null;
}
