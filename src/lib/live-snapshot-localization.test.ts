import assert from "node:assert/strict";
import test from "node:test";
import { localizeLiveTimingSnapshot } from "./live-snapshot-localization";
import type { LiveTimingSnapshot } from "@/types/openf1";

test("localizeLiveTimingSnapshot translates live session city, country, and specific session type", () => {
  const snapshot: LiveTimingSnapshot = {
    session: {
      name: "Miami Grand Prix",
      type: "Practice 1",
      location: "Miami Gardens",
      countryName: "United States",
      circuitShortName: "Miami",
      startDate: "2026-05-01T16:30:00.000Z",
      endDate: "2026-05-01T17:30:00.000Z",
      source: "F1 Live Timing",
    },
    leaderboard: [],
    telemetry: null,
    updatedAt: "2026-05-01T16:45:00.000Z",
  };

  assert.deepEqual(localizeLiveTimingSnapshot(snapshot).session, {
    name: "迈阿密大奖赛",
    type: "第一次练习赛",
    location: "迈阿密花园",
    countryName: "美国",
    circuitShortName: "迈阿密国际赛道",
    startDate: "2026-05-01T16:30:00.000Z",
    endDate: "2026-05-01T17:30:00.000Z",
    source: "F1 官方实时计时",
  });
});

test("localizeLiveTimingSnapshot translates each Formula 1 session type", () => {
  const expectedTypes = new Map([
    ["Practice 1", "第一次练习赛"],
    ["Practice 2", "第二次练习赛"],
    ["Practice 3", "第三次练习赛"],
    ["Sprint", "冲刺赛"],
    ["Sprint Qualifying", "冲刺排位赛"],
    ["Qualifying", "排位赛"],
    ["Race", "正赛"],
  ]);

  for (const [type, expected] of expectedTypes) {
    const snapshot: LiveTimingSnapshot = {
      session: {
        name: "Miami Grand Prix",
        type,
        location: "Miami Gardens",
        countryName: "United States",
        circuitShortName: "Miami",
        startDate: "2026-05-01T16:30:00.000Z",
        endDate: "2026-05-01T17:30:00.000Z",
        source: "F1 Live Timing",
      },
      leaderboard: [],
      telemetry: null,
      updatedAt: "2026-05-01T16:45:00.000Z",
    };

    assert.equal(localizeLiveTimingSnapshot(snapshot).session?.type, expected);
  }
});
