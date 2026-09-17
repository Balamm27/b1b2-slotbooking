import assert from "node:assert/strict";
import test from "node:test";
import { INDIA_ZONE, SEATTLE_ZONE, displayAttemptDate, displayClock, displayRange, sourceDateForDisplayDate } from "../app/time-zone.mjs";

test("converts September Seattle windows to IST, including next-day windows", () => {
  assert.deepEqual(displayClock("2026-09-17", "4:26 PM", INDIA_ZONE), { date: "2026-09-18", time: "4:56 AM" });
  assert.deepEqual(displayClock("2026-09-17", "8:56 AM", INDIA_ZONE), { date: "2026-09-17", time: "9:26 PM" });
  assert.equal(displayRange("2026-09-17", "4:25:50–4:26:10", "4:26 PM", INDIA_ZONE), "4:55:50 AM–4:56:10 AM");
  assert.equal(displayAttemptDate("2026-09-17", "4:26 PM", INDIA_ZONE), "2026-09-18");
  assert.equal(sourceDateForDisplayDate("2026-09-18", "4:26 PM", INDIA_ZONE), "2026-09-17");
});

test("uses the date-specific Seattle daylight-saving offset", () => {
  assert.deepEqual(displayClock("2026-01-17", "4:26 PM", INDIA_ZONE), { date: "2026-01-18", time: "5:56 AM" });
  assert.deepEqual(displayClock("2026-03-08", "8:56 AM", INDIA_ZONE), { date: "2026-03-08", time: "9:26 PM" });
  assert.deepEqual(displayClock("2026-11-01", "8:56 AM", INDIA_ZONE), { date: "2026-11-01", time: "10:26 PM" });
  assert.deepEqual(displayClock("2026-09-17", "4:26 PM", SEATTLE_ZONE), { date: "2026-09-17", time: "4:26 PM" });
});

test("leaves unknown historical dates and unrecorded click ranges unchanged", () => {
  assert.equal(displayAttemptDate("Date TBD", "10:26 AM", INDIA_ZONE), "Date TBD");
  assert.equal(displayRange("2026-09-17", "Not recorded", "3:28 PM", INDIA_ZONE), "Not recorded");
  assert.equal(displayRange("2026-09-17", "Around 3:28 PM", "3:28 PM", INDIA_ZONE), "Around 3:58 AM");
});
