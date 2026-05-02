import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { getF1LiveTimingSnapshot } from "./f1-live-timing-api";

function mockFetch(t: TestContext, fetchMock: typeof globalThis.fetch) {
  const originalFetch = globalThis.fetch;

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = fetchMock;
}

test("getF1LiveTimingSnapshot uses latest OpenF1 session when F1 static timing is stale", async (t) => {
  mockFetch(t, async (input) => {
    const url = String(input);

    if (url === "https://livetiming.formula1.com/static/Index.json") {
      return Response.json({ Years: [{ Year: 2026, Path: "2026/" }] });
    }

    if (url.endsWith("/2026/Index.json")) {
      return Response.json({
        Meetings: [
          {
            Name: "Japanese Grand Prix",
            Location: "Suzuka",
            Country: { Name: "Japan" },
            Circuit: { ShortName: "Suzuka" },
            Sessions: [
              {
                Name: "Race",
                Type: "Race",
                StartDate: "2026-03-29T14:00:00",
                EndDate: "2026-03-29T16:00:00",
                GmtOffset: "09:00:00",
                Path: "2026/2026-03-29_Japanese_Grand_Prix/2026-03-29_Race/",
              },
            ],
          },
        ],
      });
    }

    if (url.endsWith("/DriverList.json")) {
      return Response.json({
        "1": {
          RacingNumber: "1",
          Tla: "VER",
          BroadcastName: "M VERSTAPPEN",
          FullName: "Max Verstappen",
          TeamName: "Red Bull Racing",
          TeamColour: "3671C6",
        },
      });
    }

    if (url.endsWith("/TimingData.json")) {
      return Response.json({
        Lines: {
          "1": {
            Position: "1",
            RacingNumber: "1",
            NumberOfLaps: 53,
          },
        },
      });
    }

    if (url === "https://api.openf1.org/v1/sessions?year=2026") {
      return Response.json([
        {
          meeting_key: 1400,
          session_key: 2000,
          location: "Miami Gardens",
          session_type: "Practice",
          session_name: "Practice 1",
          date_start: "2026-05-01T16:00:00+00:00",
          date_end: "2026-05-01T17:00:00+00:00",
          country_key: 19,
          country_code: "USA",
          country_name: "United States",
          circuit_key: 151,
          circuit_short_name: "Miami",
          year: 2026,
        },
      ]);
    }

    if (url === "https://api.openf1.org/v1/drivers?session_key=2000") {
      return Response.json([
        {
          driver_number: 4,
          broadcast_name: "L NORRIS",
          full_name: "Lando Norris",
          name_acronym: "NOR",
          team_name: "McLaren",
          team_colour: "FF8000",
        },
        {
          driver_number: 81,
          broadcast_name: "O PIASTRI",
          full_name: "Oscar Piastri",
          name_acronym: "PIA",
          team_name: "McLaren",
          team_colour: "FF8000",
        },
      ]);
    }

    if (url === "https://api.openf1.org/v1/position?session_key=2000") {
      return Response.json([
        {
          date: "2026-05-01T16:30:00+00:00",
          meeting_key: 1400,
          session_key: 2000,
          driver_number: 4,
          position: 1,
        },
        {
          date: "2026-05-01T16:30:00+00:00",
          meeting_key: 1400,
          session_key: 2000,
          driver_number: 81,
          position: 2,
        },
      ]);
    }

    if (url === "https://api.openf1.org/v1/laps?session_key=2000") {
      return Response.json([
        {
          lap_number: 12,
          lap_duration: 91.234,
          driver_number: 4,
          i1_speed: 290,
          i2_speed: 285,
          st_speed: 320,
        },
        {
          lap_number: 10,
          lap_duration: 91.734,
          driver_number: 81,
          i1_speed: 288,
          i2_speed: 283,
          st_speed: 318,
        },
      ]);
    }

    return new Response("not found", { status: 404 });
  });

  const snapshot = await getF1LiveTimingSnapshot(null, new Date("2026-05-01T16:45:00Z"));

  assert.equal(snapshot.session?.name, "Miami Gardens");
  assert.equal(snapshot.session?.type, "Practice 1");
  assert.equal(snapshot.session?.source, "OpenF1");
  assert.equal(snapshot.telemetry?.i1Speed, "290");
  assert.equal(snapshot.telemetry?.i2Speed, "285");
  assert.equal(snapshot.telemetry?.stSpeed, "320");
  assert.equal(snapshot.telemetry?.finishLineSpeed, undefined);
  assert.deepEqual(snapshot.leaderboard, [
    {
      position: 1,
      driverNumber: 4,
      driverCode: "NOR",
      driverName: "Lando Norris",
      team: "McLaren",
      teamColor: "#FF8000",
      laps: 12,
      lastLapTime: "1:31.234",
      gapToLeader: "1:31.234",
    },
    {
      position: 2,
      driverNumber: 81,
      driverCode: "PIA",
      driverName: "Oscar Piastri",
      team: "McLaren",
      teamColor: "#FF8000",
      laps: 10,
      lastLapTime: "1:31.734",
      gapToLeader: "+0.500",
      interval: "+0.500",
    },
  ]);
});

test("getF1LiveTimingSnapshot maps official live timing speed traps", async (t) => {
  mockFetch(t, async (input) => {
    const url = String(input);

    if (url === "https://livetiming.formula1.com/static/Index.json") {
      return Response.json({ Years: [{ Year: 2026, Path: "2026/" }] });
    }

    if (url.endsWith("/2026/Index.json")) {
      return Response.json({
        Meetings: [
          {
            Name: "Miami Grand Prix",
            Location: "Miami Gardens",
            Country: { Name: "United States" },
            Circuit: { ShortName: "Miami" },
            Sessions: [
              {
                Name: "Qualifying",
                Type: "Qualifying",
                StartDate: "2026-05-02T16:00:00",
                EndDate: "2026-05-02T17:00:00",
                GmtOffset: "-04:00:00",
                Path: "2026/2026-05-02_Miami_Grand_Prix/2026-05-02_Qualifying/",
              },
            ],
          },
        ],
      });
    }

    if (url.endsWith("/DriverList.json")) {
      return Response.json({
        "4": {
          RacingNumber: "4",
          Tla: "NOR",
          BroadcastName: "L NORRIS",
          FullName: "Lando Norris",
          TeamName: "McLaren",
          TeamColour: "FF8000",
        },
      });
    }

    if (url.endsWith("/TimingData.json")) {
      return Response.json({
        Lines: {
          "4": {
            Position: "1",
            RacingNumber: "4",
            NumberOfLaps: 12,
            Speeds: {
              I1: { Value: "290" },
              I2: { Value: "285" },
              ST: { Value: "320" },
              FL: { Value: "305" },
            },
          },
        },
      });
    }

    if (url === "https://api.openf1.org/v1/sessions?year=2026") {
      return Response.json([]);
    }

    return new Response("not found", { status: 404 });
  });

  const snapshot = await getF1LiveTimingSnapshot(4, new Date("2026-05-02T20:30:00Z"));

  assert.equal(snapshot.telemetry?.i1Speed, "290");
  assert.equal(snapshot.telemetry?.i2Speed, "285");
  assert.equal(snapshot.telemetry?.stSpeed, "320");
  assert.equal(snapshot.telemetry?.finishLineSpeed, "305");
});
