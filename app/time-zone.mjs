export const SEATTLE_ZONE = "America/Los_Angeles";
export const INDIA_ZONE = "Asia/Kolkata";

const dateFormatter = (timeZone) => new Intl.DateTimeFormat("en-US", {
  timeZone, year: "numeric", month: "2-digit", day: "2-digit",
});

export function dateInZone(instant, timeZone) {
  const parts = Object.fromEntries(dateFormatter(timeZone).formatToParts(instant).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function parseClock(clock) {
  const match = clock.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hour, minute, second, period] = match;
  return {
    hour: Number(hour) % 12 + (period.toUpperCase() === "PM" ? 12 : 0),
    minute: Number(minute), second: Number(second ?? 0), hasSeconds: second !== undefined,
  };
}

function seattleInstant(date, clock) {
  const time = parseClock(clock);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) return null;
  const [year, month, day] = date.split("-").map(Number);
  // Our tracked windows start after 6 a.m.; noon has the same Pacific offset,
  // including on both daylight-saving transition days.
  const noon = new Date(Date.UTC(year, month - 1, day, 12));
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: SEATTLE_ZONE, timeZoneName: "shortOffset",
  }).formatToParts(noon).find((part) => part.type === "timeZoneName")?.value;
  const offset = offsetName?.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!offset) return null;
  const offsetMinutes = (offset[1] === "+" ? 1 : -1) * (Number(offset[2]) * 60 + Number(offset[3] ?? 0));
  return { instant: new Date(Date.UTC(year, month - 1, day, time.hour, time.minute, time.second) - offsetMinutes * 60_000), hasSeconds: time.hasSeconds };
}

export function displayClock(date, clock, timeZone) {
  if (timeZone === SEATTLE_ZONE) return { date, time: clock };
  const converted = seattleInstant(date, clock);
  if (!converted) return { date, time: clock };
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone, hour: "numeric", minute: "2-digit",
    ...(converted.hasSeconds ? { second: "2-digit" } : {}), hour12: true,
  }).format(converted.instant).replace(/\u202f/g, " ");
  return { date: dateInZone(converted.instant, timeZone), time };
}

export function displayRange(date, range, sourceWindow, timeZone) {
  if (timeZone === SEATTLE_ZONE || range === "Not recorded") return range;
  const period = sourceWindow.match(/(AM|PM)$/i)?.[1];
  if (!period) return range;
  const approximate = range.startsWith("Around ");
  const bare = approximate ? range.slice(7) : range;
  const converted = bare.split("–").map((part) => {
    const clock = /(AM|PM)$/i.test(part.trim()) ? part.trim() : `${part.trim()} ${period}`;
    return displayClock(date, clock, timeZone).time;
  });
  return `${approximate ? "Around " : ""}${converted.join("–")}`;
}

export function displayAttemptDate(date, sourceWindow, timeZone) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return displayClock(date, sourceWindow, timeZone).date;
}

function shiftDate(date, days) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function sourceDateForDisplayDate(date, sourceWindow, timeZone) {
  if (timeZone === SEATTLE_ZONE) return date;
  for (const offset of [-1, 0, 1]) {
    const candidate = shiftDate(date, offset);
    if (displayAttemptDate(candidate, sourceWindow, timeZone) === date) return candidate;
  }
  return date;
}
