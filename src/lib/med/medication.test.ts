import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applySkip, applyTake, remainingSeconds, statusFor, toDue } from "./medication.ts";
import type { Medication } from "./types.ts";

function med(over: Partial<Medication> = {}): Medication {
  const now = 1_700_000_000_000;
  return {
    id: 1,
    name: "A",
    condition: "",
    dosage: "10mg",
    interval: 3600,
    intervalHours: 1,
    quantity: 10,
    running: true,
    nextDoseAt: now + 3600_000,
    pendingDose: false,
    snoozeCount: 0,
    createdAt: now,
    updatedAt: now,
    history: [],
    ...over,
  };
}

describe("statusFor", () => {
  const scheduled = 1_000_000;
  it("on-time within the hour after", () => {
    assert.equal(statusFor(scheduled + 10 * 60_000, scheduled), "on-time");
  });
  it("early more than 30 minutes before", () => {
    assert.equal(statusFor(scheduled - 31 * 60_000, scheduled), "early");
  });
  it("late more than 60 minutes after", () => {
    assert.equal(statusFor(scheduled + 61 * 60_000, scheduled), "late");
  });
  it("missed after 4 hours", () => {
    assert.equal(statusFor(scheduled + 5 * 60 * 60_000, scheduled), "missed");
  });
});

describe("toDue / take", () => {
  it("marks pending and stops the timer", () => {
    const now = 1_700_000_000_000;
    const due = toDue(med({ nextDoseAt: now }), now);
    assert.equal(due.pendingDose, true);
    assert.equal(due.running, false);
    assert.equal(due.dueScheduledAt, now);
  });
  it("take starts the next interval immediately from now", () => {
    const now = 1_700_000_000_000;
    const due = toDue(med({ nextDoseAt: now, quantity: 5 }), now);
    const taken = applyTake(due, now);
    assert.equal(taken.pendingDose, false);
    assert.equal(taken.running, true);
    assert.equal(taken.quantity, 4);
    assert.equal(taken.nextDoseAt, now + 3600_000);
    assert.equal(taken.history[0]?.status, "on-time");
  });
  it("skip records skipped and schedules next", () => {
    const now = 1_700_000_000_000;
    const due = toDue(med({ nextDoseAt: now, quantity: 5 }), now);
    const skipped = applySkip(due, now);
    assert.equal(skipped.history[0]?.status, "skipped");
    assert.equal(skipped.quantity, 5);
    assert.equal(skipped.running, true);
  });
});

describe("remainingSeconds is display-only", () => {
  it("counts down from nextDoseAt", () => {
    const now = 1_000_000;
    const r = remainingSeconds(med({ running: true, nextDoseAt: now + 90_000, pendingDose: false }), now);
    assert.equal(r, 90);
  });
  it("is zero when pending", () => {
    assert.equal(remainingSeconds(med({ pendingDose: true, running: false }), 0), 0);
  });
});
