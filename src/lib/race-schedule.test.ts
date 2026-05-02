import assert from "node:assert/strict";
import test from "node:test";
import { getRaceDisplayDate, getRaceDisplayTime } from "./f1-api";
import { getRaceWeekendSessions } from "./race-schedule";
import type { Race } from "@/types/f1";

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

test("getRaceDisplayDate uses the Shanghai date for UTC race times", () => {
  const race = createRace();

  assert.equal(getRaceDisplayDate(race), "2026年05月04日");
  assert.equal(getRaceDisplayDate(race, "short"), "05月04日");
  assert.equal(getRaceDisplayTime(race), "04:00 AM");
});

test("getRaceDisplayDate keeps the API date when race time is pending", () => {
  const race = createRace({ time: undefined });

  assert.equal(getRaceDisplayDate(race), "2026年05月03日");
  assert.equal(getRaceDisplayDate(race, "short"), "05月03日");
  assert.equal(getRaceDisplayTime(race), "时间待定");
});

test("getRaceWeekendSessions uses the Shanghai date for UTC session times", () => {
  const race = createRace({
    FirstPractice: { date: "2026-05-01", time: "16:30:00Z" },
    SprintQualifying: { date: "2026-05-01", time: "20:30:00Z" },
    Sprint: { date: "2026-05-02", time: "16:00:00Z" },
    Qualifying: { date: "2026-05-02", time: "20:00:00Z" },
  });

  assert.deepEqual(getRaceWeekendSessions(race), [
    {
      label: "一练",
      value: "05月02日 00:30",
      type: "practice1",
      supportsResults: false,
    },
    {
      label: "冲刺排位",
      value: "05月02日 04:30",
      type: "sprintQualifying",
      supportsResults: false,
    },
    {
      label: "冲刺赛",
      value: "05月03日 00:00",
      type: "sprint",
      supportsResults: true,
    },
    {
      label: "排位赛",
      value: "05月03日 04:00",
      type: "qualifying",
      supportsResults: true,
    },
    {
      label: "正赛",
      value: "05月04日 04:00",
      type: "race",
      supportsResults: true,
    },
  ]);
});

test("getRaceWeekendSessions keeps the API date when session time is pending", () => {
  const race = createRace({
    FirstPractice: { date: "2026-05-01" },
    time: undefined,
  });

  assert.deepEqual(getRaceWeekendSessions(race), [
    {
      label: "一练",
      value: "05月01日 时间待定",
      type: "practice1",
      supportsResults: false,
    },
    {
      label: "正赛",
      value: "05月03日 时间待定",
      type: "race",
      supportsResults: true,
    },
  ]);
});
