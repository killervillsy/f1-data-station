// OpenF1 API Types

export interface OpenF1Session {
  meeting_key: number;
  session_key: number;
  location: string;
  session_type: string;
  session_name: string;
  date_start: string;
  date_end: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  year: number;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string;
  country_code: string;
  meeting_key: number;
  session_key: number;
}

export interface OpenF1Position {
  date: string;
  meeting_key: number;
  session_key: number;
  driver_number: number;
  position: number;
}

export interface OpenF1Lap {
  lap_number: number;
  date_start: string;
  lap_duration: number | null;
  is_pit_out_lap: boolean;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  segments: Array<{
    segment_number: number;
    status: string;
  }>;
  meeting_key: number;
  session_key: number;
  driver_number: number;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
}

export interface OpenF1CarData {
  date: string;
  meeting_key: number;
  session_key: number;
  driver_number: number;
  speed: number;
  throttle: number;
  brake: boolean;
  drs: number;
  rpm: number;
  gear: number;
  n_gear: number;
}

export interface OpenF1PitStop {
  date: string;
  lap_number: number;
  pit_duration: number | null;
  driver_number: number;
  meeting_key: number;
  session_key: number;
}

export interface OpenF1Weather {
  date: string;
  session_key: number;
  meeting_key: number;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  rainfall: number;
}

export interface OpenF1RaceControl {
  date: string;
  session_key: number;
  meeting_key: number;
  category: string;
  flag: string | null;
  scope: string;
  sector: number | null;
  message: string;
  lap_number: number | null;
  driver_number: number | null;
}

export interface LiveSessionSnapshot {
  name: string;
  type: string;
  location: string;
  countryName: string;
  circuitShortName: string;
  startDate: string;
  endDate: string;
  source: string;
}

export interface LiveLeaderboardItem {
  position: number;
  driverNumber: number;
  driverCode: string;
  driverName: string;
  team: string;
  teamColor: string;
  gapToLeader?: string;
  interval?: string;
  lastLapTime?: string;
  bestLapTime?: string;
  laps?: number;
  pitStops?: number;
  status?: string;
}

export interface LiveTelemetrySnapshot {
  driverNumber: number;
  speed: number | null;
  throttle: number | null;
  brake: boolean | null;
  drs: number | null;
  rpm: number | null;
  gear: number | null;
  date: string;
  i1Speed?: string;
  i2Speed?: string;
  stSpeed?: string;
  finishLineSpeed?: string;
}

export interface LiveTimingSnapshot {
  session: LiveSessionSnapshot | null;
  leaderboard: LiveLeaderboardItem[];
  telemetry: LiveTelemetrySnapshot | null;
  updatedAt: string;
  error?: string;
}
