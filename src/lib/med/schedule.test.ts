import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  intervalSecondsForTimes,
  nextDoseAfterAction,
  nextOccurrence,
  normalizeTimes,
  todaysPlan,
} from "./schedule.ts";
import type { Medication } from "./types.ts";

describe("normalizeTimes", () => {
  it("sorts, pads, and dedupes", () => {
    assert.deepEqual(normalizeTimes(["8:00", "20:00", "08:00", "bad"]), ["08:00", "20:00"]);
  });
});

describe("nextOccurrence", () => {
  it("picks the next clock time later today", () => {
    const from = new Date(2026, 0, 15, 10, 0, 0).getTime();
    const next = nextOccurrence(["08:00", "14:00", "20:00"], from);
    const d = new Date(next);
    assert.equal(d.getHours(), 14);
    assert.equal(d.getMinutes(), 0);
    assert.equal(d.getDate(), 15);
  });
  it("wraps to tomorrow when all of today's slots passed", () => {
    const from = new Date(2026, 0, 15, 21, 0, 0).getTime();
    const next = nextOccurrence(["08:00", "14:00"], from);
    const d = new Date(next);
    assert.equal(d.getDate(), 16);
    assert.equal(d.getHours(), 8);
  });
});

describe("intervalSecondsForTimes", () => {
  it("uses the smallest gap including overnight wrap", () => {
    assert.equal(intervalSecondsForTimes(["08:00", "20:00"]), 12 * 3600);
    assert.equal(intervalSecondsForTimes(["08:00"]), 86400);
  });
});

describe("nextDoseAfterAction", () => {
  it("skips the consumed clock slot when taking early", () => {
    const now = new Date(2026, 0, 15, 7, 0, 0).getTime();
    const slot = new Date(2026, 0, 15, 8, 0, 0).getTime();
    const next = nextDoseAfterAction(
      {
        scheduleKind: "times",
        times: ["08:00", "14:00", "20:00"],
        interval: 6 * 3600,
        nextDoseAt: slot,
      },
      now,
    );
    const d = new Date(next);
    assert.equal(d.getHours(), 14);
    assert.equal(d.getDate(), 15);
  });
});

describe("todaysPlan", () => {
  it("marks the active times-slot as due and later ones upcoming", () => {
    const now = new Date(2026, 0, 15, 8, 5, 0).getTime();
    const slot = new Date(2026, 0, 15, 8, 0, 0).getTime();
    const med: Medication = {
      id: 3,
      name: "آموکسی",
      condition: "",
      dosage: "۵۰۰ mg",
      notes: "",
      accent: "terra",
      scheduleKind: "times",
      times: ["08:00", "14:00", "20:00"],
      interval: 6 * 3600,
      intervalHours: 8,
      quantity: 20,
      running: false,
      pendingDose: true,
      dueScheduledAt: slot,
      snoozeCount: 0,
      createdAt: now,
      updatedAt: now,
      history: [],
    };
    const plan = todaysPlan([med], now);
    assert.equal(plan.length, 3);
    assert.equal(plan[0]?.state, "due");
    assert.equal(plan[1]?.state, "upcoming");
    assert.equal(plan[2]?.state, "upcoming");
  });
});
