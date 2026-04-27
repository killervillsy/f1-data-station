import type {
  OpenF1Session,
  OpenF1Driver,
  OpenF1Position,
  OpenF1Lap,
  OpenF1CarData,
} from "@/types/openf1";

const BASE_URL = "https://api.openf1.org/v1";

// Cache for 10 seconds for live data
const liveRevalidate = 10;

async function fetchOpenF1Data<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    next: { revalidate: liveRevalidate },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenF1 data for ${endpoint}: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}

// Get current/latest session
export async function getLatestSession(): Promise<OpenF1Session | null> {
  try {
    const sessions = await fetchOpenF1Data<OpenF1Session[]>("/sessions");

    // Get the most recent session
    if (sessions.length === 0) return null;

    // Sort by date and get the latest
    const sorted = sessions.sort(
      (a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );

    return sorted[0];
  } catch {
    return null;
  }
}

// Get drivers for a session
export async function getSessionDrivers(
  sessionKey: number
): Promise<OpenF1Driver[]> {
  try {
    return await fetchOpenF1Data<OpenF1Driver[]>(
      `/drivers?session_key=${sessionKey}`
    );
  } catch {
    return [];
  }
}

// Get current positions
export async function getCurrentPositions(
  sessionKey: number
): Promise<OpenF1Position[]> {
  try {
    const positions = await fetchOpenF1Data<OpenF1Position[]>(
      `/position?session_key=${sessionKey}`
    );

    // Get the latest position for each driver
    const latestPositions = new Map<number, OpenF1Position>();
    for (const pos of positions) {
      const existing = latestPositions.get(pos.driver_number);
      if (!existing || new Date(pos.date) > new Date(existing.date)) {
        latestPositions.set(pos.driver_number, pos);
      }
    }

    return Array.from(latestPositions.values()).sort(
      (a, b) => a.position - b.position
    );
  } catch {
    return [];
  }
}

// Get lap data for a driver
export async function getDriverLaps(
  sessionKey: number,
  driverNumber: number
): Promise<OpenF1Lap[]> {
  try {
    return await fetchOpenF1Data<OpenF1Lap[]>(
      `/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
    );
  } catch {
    return [];
  }
}

// Get car telemetry
export async function getCarTelemetry(
  sessionKey: number,
  driverNumber?: number
): Promise<OpenF1CarData[]> {
  try {
    let endpoint = `/car_data?session_key=${sessionKey}`;
    if (driverNumber) {
      endpoint += `&driver_number=${driverNumber}`;
    }

    return await fetchOpenF1Data<OpenF1CarData[]>(endpoint);
  } catch {
    return [];
  }
}

export async function getLatestCarTelemetry(
  sessionKey: number,
  driverNumber: number
): Promise<OpenF1CarData | null> {
  const telemetry = await getCarTelemetry(sessionKey, driverNumber);

  if (telemetry.length === 0) return null;

  return telemetry.reduce((latest, current) =>
    new Date(current.date) > new Date(latest.date) ? current : latest
  );
}

// Combined live timing data
export async function getLiveTimingData(): Promise<{
  session: OpenF1Session | null;
  drivers: OpenF1Driver[];
  positions: OpenF1Position[];
}> {
  const session = await getLatestSession();

  if (!session) {
    return { session: null, drivers: [], positions: [] };
  }

  const [drivers, positions] = await Promise.all([
    getSessionDrivers(session.session_key),
    getCurrentPositions(session.session_key),
  ]);

  return { session, drivers, positions };
}
