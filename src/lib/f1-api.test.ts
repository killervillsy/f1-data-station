import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { getNextRace, getSprintResults, isRaceInProgress } from "./f1-api";
import type { Race } from "@/types/f1";

function mockFetch(t: TestContext, fetchMock: typeof globalThis.fetch) {
  const originalFetch = globalThis.fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = fetchMock;
}

function createRace(overrides: Partial<Race> = {}): Race {
  return {
    season: "2026",
    round: "4",
    url: "https://example.com/race",
    raceName: "Miami Grand Prix",
    date: "2026-05-03",
    time: "20:00:00Z",
    Circuit: {
      circuitId: "miami",
      url: "https://example.com/circuit",
      circuitName: "Miami International Autodrome",
      Location: {
        lat: "25.9581",
        long: "-80.2389",
        locality: "Miami",
        country: "USA",
      },
    },
    ...overrides,
  };
}

test("isRaceInProgress returns true from first practice through the race window", () => {
  const race = createRace({
    FirstPractice: { date: "2026-05-01", time: "16:30:00Z" },
  });

  assert.equal(isRaceInProgress(race, new Date("2026-05-01T16:30:00Z")), true);
  assert.equal(isRaceInProgress(race, new Date("2026-05-03T20:30:00Z")), true);
  assert.equal(isRaceInProgress(race, new Date("2026-05-01T16:29:59Z")), false);
  assert.equal(isRaceInProgress(race, new Date("2026-05-03T23:00:01Z")), false);
});

test("getSprintResults fetches and returns sprint results", async (t) => {
  let requestedUrl = "";
  let fetchOptions: RequestInit | undefined;

  mockFetch(t, async (input, init) => {
    requestedUrl = String(input);
    fetchOptions = init;

    return Response.json({
      MRData: {
        RaceTable: {
          Races: [
            {
              SprintResults: [
                {
                  number: "1",
                  position: "1",
                  positionText: "1",
                  points: "8",
                  Driver: {
                    driverId: "verstappen",
                    url: "https://example.com/verstappen",
                    givenName: "Max",
                    familyName: "Verstappen",
                    dateOfBirth: "1997-09-30",
                    nationality: "Dutch",
                    code: "VER",
                  },
                  Constructor: {
                    constructorId: "red_bull",
                    url: "https://example.com/red-bull",
                    name: "Red Bull Racing",
                    nationality: "Austrian",
                  },
                  grid: "1",
                  laps: "19",
                  status: "Finished",
                  Time: { millis: "1800000", time: "30:00.000" },
                },
              ],
            },
          ],
        },
      },
    });
  });

  const results = await getSprintResults("2024", "6");

  assert.equal(requestedUrl, "https://api.jolpi.ca/ergast/f1/2024/6/sprint.json");
  assert.deepEqual(fetchOptions?.next, {
    revalidate: 86_400,
    tags: ["f1:sprint", "f1:season:2024", "f1:round:6"],
  });
  assert.equal(results[0]?.Driver.driverId, "verstappen");
  assert.equal(results[0]?.points, "8");
});

test("getNextRace returns the current race while it is in progress", async (t) => {
  let fetchOptions: RequestInit | undefined;

  mockFetch(t, async (_input, init) => {
    fetchOptions = init;

    return Response.json({
      MRData: {
        RaceTable: {
          Races: [
            createRace({
              date: "2026-04-03",
              time: "20:00:00Z",
              FirstPractice: { date: "2026-04-01", time: "16:30:00Z" },
            }),
            createRace({
              round: "5",
              raceName: "Canadian Grand Prix",
              date: "2026-05-24",
              time: "20:00:00Z",
            }),
          ],
        },
      },
    });
  });

  const race = await getNextRace(new Date("2026-04-01T20:30:00Z"));

  assert.deepEqual(fetchOptions?.next, {
    revalidate: 3_600,
    tags: ["f1:schedule", "f1:season:2026"],
  });
  assert.equal(race?.round, "4");
});
