// F1 API Types based on Ergast API

export interface MRData {
  xmlns: string;
  series: string;
  url: string;
  limit: string;
  offset: string;
  total: string;
  RaceTable?: RaceTable;
  StandingsTable?: StandingsTable;
  DriverTable?: DriverTable;
  ConstructorTable?: ConstructorTable;
}

export interface RaceTable {
  season: string;
  Races: Race[];
}

export interface PitStopTable {
  season: string;
  round: string;
  Races: PitStopRace[];
}

export interface PitStopRace extends Race {
  PitStops?: PitStop[];
}

export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time?: string;
  FirstPractice?: RaceSession;
  SecondPractice?: RaceSession;
  ThirdPractice?: RaceSession;
  Qualifying?: RaceSession;
  Sprint?: RaceSession;
  SprintQualifying?: RaceSession;
  SprintShootout?: RaceSession;
  Results?: RaceResult[];
  results?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
}

export interface RaceSession {
  date: string;
  time?: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: Location;
}

export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  pitStops?: number;
  grid: string;
  laps: string;
  status: string;
  Time?: Time;
  FastestLap?: FastestLap;
}

export interface QualifyingResult {
  number: string;
  position: string;
  Driver: Driver;
  Constructor: Constructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface Time {
  millis: string;
  time: string;
}

export interface PitStop {
  driverId: string;
  stop: string;
  lap: string;
  time: string;
  duration: string;
}

export interface FastestLap {
  rank: string;
  lap: string;
  Time: Time;
  AverageSpeed?: AverageSpeed;
}

export interface AverageSpeed {
  units: string;
  speed: string;
}

export interface Driver {
  driverId: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  code?: string;
  permanentNumber?: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface StandingsTable {
  season: string;
  round?: string;
  StandingsLists: StandingsList[];
}

export interface StandingsList {
  season: string;
  round: string;
  DriverStandings?: DriverStanding[];
  ConstructorStandings?: ConstructorStanding[];
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface DriverTable {
  season?: string;
  driverId?: string;
  Drivers: Driver[];
}

export interface ConstructorTable {
  season?: string;
  constructorId?: string;
  Constructors: Constructor[];
}
