"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import bundledData from "../public/data/attempts.json";

type StageState = "pass" | "fail" | "pending";
type Attempt = {
  id: string;
  date: string;
  window: string;
  selectWindow: string;
  calendar: StageState;
  time: StageState;
  submitClicked: StageState;
  slotAccepted: StageState;
  bookingCompleted: StageState;
  notes: string;
  slotsSeen?: number;
  weight?: number;
  inferred?: boolean;
  sourceUrl?: string;
};

type StoredAttempt = Omit<Attempt, "submitClicked" | "slotAccepted" | "bookingCompleted"> & {
  submitClicked?: StageState;
  slotAccepted?: StageState;
  bookingCompleted?: StageState;
  submit?: StageState;
  consular?: StageState;
};

type WindowRow = {
  window: string;
  login: string;
  schedule: string;
  select: string;
  status: "active" | "removed" | "research";
  basis: string;
};

type CalendarDay = {
  date: string;
  attempts: Attempt[];
  runs: number;
  stage: number;
  calendarHits: number;
  timeHits: number;
  submitHits: number;
  slotsSeen: number;
  slotReports: number;
};

const stageLabels = ["No calendar", "Calendar appeared", "Time appeared", "Submit reached", "Slot accepted", "Booking completed"];
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function attemptStage(attempt: Attempt) {
  if (attempt.bookingCompleted === "pass") return 5;
  if (attempt.slotAccepted === "pass") return 4;
  if (attempt.submitClicked === "pass") return 3;
  if (attempt.time === "pass") return 2;
  if (attempt.calendar === "pass") return 1;
  return 0;
}

function isExactDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function formatCalendarDate(date: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(new Date(Date.UTC(year, month - 1, day)));
}

function normalizeAttempt(attempt: StoredAttempt): Attempt {
  if (attempt.submitClicked && attempt.slotAccepted && attempt.bookingCompleted) return attempt as Attempt;
  return {
    ...attempt,
    submitClicked: attempt.submit === "pass" || attempt.submit === "fail" ? "pass" : "pending",
    slotAccepted: attempt.submit ?? "pending",
    bookingCompleted: "pending",
  };
}

const bundledAttempts = (bundledData.attempts as StoredAttempt[]).map(normalizeAttempt);
const latestBundledDate = bundledAttempts.map((attempt) => attempt.date).filter(isExactDate).sort().at(-1) ?? "2026-08-01";
const gitDataUrl = "https://raw.githubusercontent.com/Balamm27/b1b2-slotbooking/refs/heads/feature/chennai-slot-dashboard/public/data/attempts.json";
const newIssueUrl = "https://github.com/Balamm27/b1b2-slotbooking/issues/new";

const windows: WindowRow[] = [
  { window: "8:56 AM", login: "8:53:30–8:54:30", schedule: "8:55:15–8:55:35", select: "8:55:50–8:56:10", status: "removed", basis: "Two confirmed complete misses; no calendar or time inventory" },
  { window: "10:26 AM", login: "10:23:30–10:24:30", schedule: "10:25:15–10:25:35", select: "10:25:50–10:26:10", status: "active", basis: "Personal miss; earlier ranking retained for comparison" },
  { window: "10:56 AM", login: "10:53:30–10:54:30", schedule: "10:55:15–10:55:35", select: "10:55:50–10:56:10", status: "active", basis: "Personal time-slot hit; Submit lost race" },
  { window: "1:26 PM", login: "1:23:30–1:24:30", schedule: "1:25:15–1:25:35", select: "1:25:50–1:26:10", status: "active", basis: "Confirmed personal time-slot hit; Submit lost the race" },
  { window: "1:56 PM", login: "1:53:30–1:54:30", schedule: "1:55:15–1:55:35", select: "1:55:50–1:56:10", status: "active", basis: "Previously ranked candidate; source verification pending" },
  { window: "2:26 PM", login: "2:23:30–2:24:30", schedule: "2:25:15–2:25:35", select: "2:25:50–2:26:10", status: "active", basis: "Previously ranked candidate; source verification pending" },
  { window: "4:26 PM", login: "4:23:30–4:24:30", schedule: "4:25:15–4:25:35", select: "4:25:50–4:26:10", status: "active", basis: "Confirmed slot acceptance; advanced past Submit but declined a late appointment" },
  { window: "10:26 PM", login: "10:23:30–10:24:30", schedule: "10:25:15–10:25:35", select: "10:25:50–10:26:10", status: "active", basis: "Confirmed personal time-slot hit; Submit lost the race" },
  { window: "8:56 PM", login: "8:53:30–8:54:30", schedule: "8:55:15–8:55:35", select: "8:55:50–8:56:10", status: "removed", basis: "Repeated stale calendars; no time rows" },
  { window: "9:26 PM", login: "9:23:30–9:24:30", schedule: "9:25:15–9:25:35", select: "9:25:50–9:26:10", status: "removed", basis: "Stale calendar; alert-only evidence" },
  { window: "6:56 AM", login: "6:53:30–6:54:30", schedule: "6:55:15–6:55:35", select: "6:55:50–6:56:10", status: "research", basis: "Delayed alert only; no confirmed booking" },
  { window: "7:26 AM", login: "7:23:30–7:24:30", schedule: "7:25:15–7:25:35", select: "7:25:50–7:26:10", status: "research", basis: "Delayed alert only; no confirmed booking" },
  { window: "9:26 AM", login: "9:23:30–9:24:30", schedule: "9:25:15–9:25:35", select: "9:25:50–9:26:10", status: "research", basis: "Delayed alert only; no confirmed booking" },
  { window: "11:26 AM", login: "11:23:30–11:24:30", schedule: "11:25:15–11:25:35", select: "11:25:50–11:26:10", status: "research", basis: "Delayed alert only; removed from ranking" },
  { window: "11:26 PM", login: "11:23:30–11:24:30", schedule: "11:25:15–11:25:35", select: "11:25:50–11:26:10", status: "research", basis: "One confirmed complete miss; no calendar or time inventory" },
];

const outcomeMap: Record<string, Pick<Attempt, "calendar" | "time" | "submitClicked" | "slotAccepted" | "bookingCompleted">> = {
  noCalendar: { calendar: "fail", time: "pending", submitClicked: "pending", slotAccepted: "pending", bookingCompleted: "pending" },
  calendarOnly: { calendar: "pass", time: "fail", submitClicked: "pending", slotAccepted: "pending", bookingCompleted: "pending" },
  timeOnly: { calendar: "pass", time: "pass", submitClicked: "fail", slotAccepted: "pending", bookingCompleted: "pending" },
  submitRejected: { calendar: "pass", time: "pass", submitClicked: "pass", slotAccepted: "fail", bookingCompleted: "pending" },
  slotAccepted: { calendar: "pass", time: "pass", submitClicked: "pass", slotAccepted: "pass", bookingCompleted: "fail" },
  bookingCompleted: { calendar: "pass", time: "pass", submitClicked: "pass", slotAccepted: "pass", bookingCompleted: "pass" },
};

const outcomeLabels: Record<string, string> = {
  noCalendar: "No calendar",
  calendarOnly: "Calendar, no time",
  timeOnly: "Time appeared; Submit not clicked",
  submitRejected: "Submit clicked; slot rejected",
  slotAccepted: "Slot accepted; booking not completed",
  bookingCompleted: "Booking completed",
};

function StatusMark({ state }: { state: StageState }) {
  const label = state === "pass" ? "Passed" : state === "fail" ? "Failed" : "Not reached";
  return <span className={`status-mark ${state}`} aria-label={label}>{state === "pass" ? "✓" : state === "fail" ? "×" : "—"}</span>;
}

function weightedCount(attempts: Attempt[], predicate: (attempt: Attempt) => boolean) {
  return attempts.reduce((sum, attempt) => sum + (predicate(attempt) ? attempt.weight ?? 1 : 0), 0);
}

export default function Home() {
  const [attempts, setAttempts] = useState<Attempt[]>(bundledAttempts);
  const [syncState, setSyncState] = useState<"loading" | "synced" | "fallback">("loading");
  const [statusFilter, setStatusFilter] = useState<"all" | WindowRow["status"]>("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"windows" | "attempts" | "calendar">("windows");
  const [calendarMonth, setCalendarMonth] = useState(latestBundledDate.slice(0, 7));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(latestBundledDate);
  const [selectedOutcome, setSelectedOutcome] = useState("noCalendar");
  const [attemptDate, setAttemptDate] = useState(() => new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${gitDataUrl}?v=${Date.now()}`, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Git data unavailable");
        return response.json();
      })
      .then((data: { attempts?: StoredAttempt[] }) => {
        if (!Array.isArray(data.attempts)) throw new Error("Invalid Git data");
        setAttempts(data.attempts.map(normalizeAttempt));
        setSyncState("synced");
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setSyncState("fallback");
      });
    return () => controller.abort();
  }, []);

  const total = weightedCount(attempts, () => true);
  const calendarHits = weightedCount(attempts, (a) => a.calendar === "pass");
  const timeHits = weightedCount(attempts, (a) => a.time === "pass");
  const submitClickedHits = weightedCount(attempts, (a) => a.submitClicked === "pass");
  const slotAcceptedHits = weightedCount(attempts, (a) => a.slotAccepted === "pass");
  const bookingHits = weightedCount(attempts, (a) => a.bookingCompleted === "pass");
  const deepestStage = bookingHits ? ["Booking completed", "100%"] : slotAcceptedHits ? ["Slot accepted", "80%"] : submitClickedHits ? ["Submit clicked", "60%"] : timeHits ? ["Time slot", "40%"] : calendarHits ? ["Calendar", "20%"] : ["Chennai queried", "5%"];

  const datedAttempts = attempts.filter((attempt) => isExactDate(attempt.date));
  const calendarDays = datedAttempts.reduce<Record<string, CalendarDay>>((days, attempt) => {
    const day = days[attempt.date] ?? { date: attempt.date, attempts: [], runs: 0, stage: 0, calendarHits: 0, timeHits: 0, submitHits: 0, slotsSeen: 0, slotReports: 0 };
    const weight = attempt.weight ?? 1;
    day.attempts.push(attempt);
    day.runs += weight;
    day.stage = Math.max(day.stage, attemptStage(attempt));
    if (attempt.calendar === "pass") day.calendarHits += weight;
    if (attempt.time === "pass") day.timeHits += weight;
    if (attempt.submitClicked === "pass") day.submitHits += weight;
    if (typeof attempt.slotsSeen === "number") {
      day.slotsSeen += attempt.slotsSeen;
      day.slotReports += weight;
    }
    days[attempt.date] = day;
    return days;
  }, {});
  const observedDays = Object.values(calendarDays);
  const latestObservedDate = observedDays.map((day) => day.date).sort().at(-1);
  const [calendarYear, calendarMonthNumber] = calendarMonth.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(calendarYear, calendarMonthNumber - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(calendarYear, calendarMonthNumber, 0)).getUTCDate();
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const selectedDay = calendarDays[selectedCalendarDate];
  const monthDays = observedDays.filter((day) => day.date.startsWith(calendarMonth));
  const monthRuns = monthDays.reduce((sum, day) => sum + day.runs, 0);
  const monthCalendarHits = monthDays.reduce((sum, day) => sum + day.calendarHits, 0);
  const monthTimeHits = monthDays.reduce((sum, day) => sum + day.timeHits, 0);
  const monthSubmitHits = monthDays.reduce((sum, day) => sum + day.submitHits, 0);
  const monthSlotsSeen = monthDays.reduce((sum, day) => sum + day.slotsSeen, 0);
  const monthSlotReports = monthDays.reduce((sum, day) => sum + day.slotReports, 0);
  const weekdayRollup = weekdayLabels.map((label, weekday) => {
    const days = observedDays.filter((day) => {
      const [year, month, date] = day.date.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, date)).getUTCDay() === weekday;
    });
    return { label, days: days.length, runs: days.reduce((sum, day) => sum + day.runs, 0), stage: days.reduce((deepest, day) => Math.max(deepest, day.stage), 0) };
  });

  function changeCalendarMonth(offset: number) {
    const next = new Date(Date.UTC(calendarYear, calendarMonthNumber - 1 + offset, 1));
    const nextMonth = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
    const firstObservedDate = observedDays.map((day) => day.date).filter((date) => date.startsWith(nextMonth)).sort()[0];
    setCalendarMonth(nextMonth);
    setSelectedCalendarDate(firstObservedDate ?? `${nextMonth}-01`);
  }

  const filteredWindows = windows.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const haystack = `${item.window} ${item.basis} ${item.status}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  });

  function addAttempt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const outcome = String(form.get("outcome"));
    const attemptedWindow = String(form.get("window"));
    const selectedWindow = windows.find((item) => item.window === attemptedWindow);
    const rawSlotsSeen = String(form.get("slotsSeen") ?? "").trim();
    const slotsSeen = rawSlotsSeen === "" ? (outcome === "noCalendar" || outcome === "calendarOnly" ? 0 : undefined) : Number(rawSlotsSeen);
    const next = {
      date: String(form.get("date")),
      window: attemptedWindow,
      selectWindow: selectedWindow?.select ?? attemptedWindow,
      ...outcomeMap[outcome],
      ...(slotsSeen === undefined ? {} : { slotsSeen }),
      notes: String(form.get("notes") || outcomeLabels[outcome]),
    };
    const body = [
      "<!-- chennai-slot-attempt:v2",
      JSON.stringify(next, null, 2),
      "-->",
      "## Chennai VAC attempt",
      "This structured record was prepared by the Chennai Slot Lab dashboard.",
      "Submitting this issue stores the attempt in the repository dataset.",
    ].join("\n");
    const issue = new URL(newIssueUrl);
    issue.searchParams.set("title", `[Attempt] ${next.date} · ${next.window}`);
    issue.searchParams.set("body", body);
    window.open(issue.toString(), "_blank", "noopener,noreferrer");
    setShowForm(false);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), attempts, windows }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chennai-vac-experiment.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const conversion = (count: number) => total ? Math.round((count / total) * 100) : 0;

  return (
    <main>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">B1</div>
          <div><strong>Chennai Slot Lab</strong><span>Evidence tracker</span></div>
        </div>
        <div className="header-actions">
          <span className={`live-pill ${syncState}`}><i /> {syncState === "synced" ? "Git-backed dataset" : syncState === "loading" ? "Syncing with Git" : "Bundled snapshot"}</span>
          <button className="ghost-button" onClick={exportData}>Export JSON</button>
          <button className="primary-button" onClick={() => setShowForm(true)}>+ Log attempt</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">B1/B2 · Chennai VAC · Pacific time</p>
          <h1>Turn every booking attempt<br />into usable evidence.</h1>
          <p className="hero-copy">Track the full race—from the VAC dropdown to final booking confirmation. No magic times, just observed outcomes.</p>
        </div>
        <div className="hero-score">
          <span>Deepest stage reached</span>
          <strong>{deepestStage[0]}</strong>
          <div className="score-track"><i style={{ width: deepestStage[1] }} /></div>
          <small>{slotAcceptedHits ? "At least one slot survived Submit" : submitClickedHits ? "Submit reached; inventory race remains" : "Building evidence stage by stage"}</small>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Experiment summary">
        <article><span>Total observed runs</span><strong>{total}</strong><small>Weighted repeated reports</small></article>
        <article><span>Calendar appeared</span><strong>{conversion(calendarHits)}%</strong><small>{calendarHits} of {total} attempts</small></article>
        <article><span>Time row appeared</span><strong>{conversion(timeHits)}%</strong><small>{timeHits} of {total} attempts</small></article>
        <article><span>Submit clicked</span><strong>{conversion(submitClickedHits)}%</strong><small>{submitClickedHits} of {total} attempts</small></article>
        <article className="danger-card"><span>Slot accepted</span><strong>{conversion(slotAcceptedHits)}%</strong><small>{slotAcceptedHits} survived the inventory race</small></article>
        <article className="success-card"><span>Booking completed</span><strong>{conversion(bookingHits)}%</strong><small>{bookingHits} final confirmations</small></article>
      </section>

      <section className="funnel-panel">
        <div className="section-heading">
          <div><p className="eyebrow">Conversion funnel</p><h2>Where luck runs out</h2></div>
          <span className="updated">Updated {latestObservedDate ? formatCalendarDate(latestObservedDate, { month: "short", day: "numeric", year: "numeric" }) : "when new evidence arrives"}</span>
        </div>
        <div className="funnel">
          {[
            ["Chennai queried", total, "100%"],
            ["Calendar dates", calendarHits, `${conversion(calendarHits)}%`],
            ["Time inventory", timeHits, `${conversion(timeHits)}%`],
            ["Submit clicked", submitClickedHits, `${conversion(submitClickedHits)}%`],
            ["Slot accepted", slotAcceptedHits, `${conversion(slotAcceptedHits)}%`],
            ["Booking completed", bookingHits, `${conversion(bookingHits)}%`],
          ].map(([label, count, percent], index) => (
            <div className="funnel-step" key={String(label)}>
              <div className="funnel-index">0{index + 1}</div>
              <div><strong>{label}</strong><span>{count} passes</span></div>
              <b>{percent}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="workspace-panel">
        <div className="workspace-toolbar">
          <div className="tabs" role="tablist">
            <button className={activeTab === "windows" ? "active" : ""} onClick={() => setActiveTab("windows")}>Window board <span>{windows.length}</span></button>
            <button className={activeTab === "attempts" ? "active" : ""} onClick={() => setActiveTab("attempts")}>Attempt log <span>{attempts.length}</span></button>
            <button className={activeTab === "calendar" ? "active" : ""} onClick={() => setActiveTab("calendar")}>Calendar insights <span>{observedDays.length}</span></button>
          </div>
          {activeTab === "windows" && <div className="filters">
            <input aria-label="Search windows" placeholder="Search windows…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select aria-label="Filter status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All statuses</option><option value="active">Active</option><option value="removed">Removed</option><option value="research">Research only</option>
            </select>
          </div>}
          {activeTab === "calendar" && <div className="calendar-nav" aria-label="Calendar month navigation">
            <button aria-label="Previous month" onClick={() => changeCalendarMonth(-1)}>←</button>
            <strong>{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(calendarYear, calendarMonthNumber - 1, 1)))}</strong>
            <button aria-label="Next month" onClick={() => changeCalendarMonth(1)}>→</button>
          </div>}
        </div>

        {activeTab === "windows" ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Window</th><th>Login range</th><th>Schedule click</th><th>Select Chennai</th><th>Runs</th><th>Calendar</th><th>Time</th><th>Slots seen</th><th>Submit clicked</th><th>Slot accepted</th><th>Booking completed</th><th>Status</th><th>Evidence</th></tr></thead>
              <tbody>{filteredWindows.map((item) => {
                const related = attempts.filter((a) => a.window.toLowerCase() === item.window.toLowerCase());
                const runs = weightedCount(related, () => true);
                const cal = weightedCount(related, (a) => a.calendar === "pass");
                const times = weightedCount(related, (a) => a.time === "pass");
                const slots = related.reduce((sum, attempt) => sum + (attempt.slotsSeen ?? 0), 0);
                const slotReports = weightedCount(related, (attempt) => typeof attempt.slotsSeen === "number");
                const clicked = weightedCount(related, (a) => a.submitClicked === "pass");
                const accepted = weightedCount(related, (a) => a.slotAccepted === "pass");
                const booked = weightedCount(related, (a) => a.bookingCompleted === "pass");
                return <tr key={item.window} className={item.status === "removed" ? "muted-row" : ""}>
                  <td><strong>{item.window}</strong><small>Pacific</small></td><td>{item.login}</td><td>{item.schedule}</td><td className="select-time">{item.select}</td><td>{runs || "—"}</td><td>{runs ? `${Math.round(cal / runs * 100)}%` : "—"}</td><td>{runs ? `${Math.round(times / runs * 100)}%` : "—"}</td><td>{slotReports ? slots : "—"}</td><td>{runs ? `${Math.round(clicked / runs * 100)}%` : "—"}</td><td>{runs ? `${Math.round(accepted / runs * 100)}%` : "—"}</td><td>{runs ? `${Math.round(booked / runs * 100)}%` : "—"}</td><td><span className={`status-chip ${item.status}`}>{item.status}</span></td><td className="evidence-cell">{item.basis}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        ) : activeTab === "attempts" ? (
          <div className="attempt-list">
            <div className="attempt-head"><span>Date / window</span><span>Calendar</span><span>Time</span><span>Slots seen</span><span>Submit clicked</span><span>Slot accepted</span><span>Booking completed</span><span>Observation</span></div>
            {attempts.map((attempt) => <article className="attempt-row" key={attempt.id}>
              <div><strong>{attempt.window}</strong><span>{attempt.date}{attempt.weight ? ` · ${attempt.weight}× runs` : ""}{attempt.inferred ? " · verify date" : ""}</span></div>
              <StatusMark state={attempt.calendar} /><StatusMark state={attempt.time} /><strong className={`slot-count ${typeof attempt.slotsSeen === "number" ? "recorded" : "unknown"}`}>{typeof attempt.slotsSeen === "number" ? attempt.slotsSeen : "—"}</strong><StatusMark state={attempt.submitClicked} /><StatusMark state={attempt.slotAccepted} /><StatusMark state={attempt.bookingCompleted} />
              <p>{attempt.notes}{attempt.sourceUrl && <a className="source-link" href={attempt.sourceUrl} target="_blank" rel="noreferrer">GitHub record ↗</a>}</p>
            </article>)}
          </div>
        ) : (
          <div className="calendar-insights">
            <div className="calendar-overview">
              <div className="calendar-shell">
                <div className="calendar-weekdays">{weekdayLabels.map((day) => <span key={day}>{day}</span>)}</div>
                <div className="calendar-grid">
                  {calendarCells.map((day, index) => {
                    if (!day) return <span className="calendar-blank" key={`blank-${index}`} />;
                    const date = `${calendarMonth}-${String(day).padStart(2, "0")}`;
                    const insight = calendarDays[date];
                    const aria = insight ? `${formatCalendarDate(date, { month: "long", day: "numeric" })}, ${insight.runs} ${insight.runs === 1 ? "attempt" : "attempts"}, deepest stage ${stageLabels[insight.stage]}` : `${formatCalendarDate(date, { month: "long", day: "numeric" })}, no attempts`;
                    return <button key={date} aria-label={`${aria}${insight?.slotReports ? `, ${insight.slotsSeen} ${insight.slotsSeen === 1 ? "slot" : "slots"} seen` : ""}`} className={`calendar-day ${insight ? `observed level-${insight.stage}` : ""} ${selectedCalendarDate === date ? "selected" : ""}`} onClick={() => setSelectedCalendarDate(date)}>
                      <span className="day-number">{day}</span>
                      {insight ? <><strong>{insight.runs}</strong><small>{insight.runs === 1 ? "attempt" : "attempts"}</small><em>{insight.slotReports ? `${insight.slotsSeen} ${insight.slotsSeen === 1 ? "slot" : "slots"} seen` : "Slots unrecorded"}</em><i>{stageLabels[insight.stage]}</i></> : <small className="no-data">No data</small>}
                    </button>;
                  })}
                </div>
                <div className="calendar-legend">
                  {stageLabels.map((label, index) => <span key={label}><i className={`level-${index}`} />{label}</span>)}
                </div>
              </div>

              <aside className="day-detail">
                <p className="eyebrow">Selected day</p>
                <h3>{formatCalendarDate(selectedCalendarDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
                {selectedDay ? <>
                  <div className="day-score"><span>Deepest stage</span><strong>{stageLabels[selectedDay.stage]}</strong><small>{selectedDay.runs} observed {selectedDay.runs === 1 ? "attempt" : "attempts"} · {selectedDay.slotReports ? `${selectedDay.slotsSeen} ${selectedDay.slotsSeen === 1 ? "slot" : "slots"} seen` : "slot count not recorded"}</small></div>
                  <div className="day-attempts">{selectedDay.attempts.map((attempt) => <article key={attempt.id}>
                    <div><strong>{attempt.window}</strong><span>{stageLabels[attemptStage(attempt)]}</span><b>{typeof attempt.slotsSeen === "number" ? `${attempt.slotsSeen} ${attempt.slotsSeen === 1 ? "slot" : "slots"}` : "Slots —"}</b></div>
                    <p>{attempt.notes}</p>
                  </article>)}</div>
                </> : <div className="empty-day"><strong>No attempts logged.</strong><p>Select a colored day to inspect what happened, or log an attempt for this date.</p></div>}
              </aside>
            </div>

            <div className="calendar-stats">
              <article><span>Observed days</span><strong>{monthDays.length}</strong><small>with exact dates this month</small></article>
              <article><span>Attempts</span><strong>{monthRuns}</strong><small>across observed days</small></article>
              <article><span>Calendar hit rate</span><strong>{monthRuns ? Math.round(monthCalendarHits / monthRuns * 100) : 0}%</strong><small>{monthCalendarHits} calendar passes</small></article>
              <article><span>Time-row hit rate</span><strong>{monthRuns ? Math.round(monthTimeHits / monthRuns * 100) : 0}%</strong><small>{monthTimeHits} time-row passes</small></article>
              <article><span>Submit reach rate</span><strong>{monthRuns ? Math.round(monthSubmitHits / monthRuns * 100) : 0}%</strong><small>{monthSubmitHits} Submit clicks</small></article>
              <article><span>Slots seen</span><strong>{monthSlotsSeen}</strong><small>reported in {monthSlotReports} {monthSlotReports === 1 ? "attempt" : "attempts"}</small></article>
            </div>

            <div className="weekday-patterns">
              <div><p className="eyebrow">Weekday pattern</p><h3>Evidence by day of week</h3><p>Color shows the deepest stage ever reached; counts show the current sample size.</p></div>
              <div className="weekday-strip">{weekdayRollup.map((day) => <article key={day.label} className={day.runs ? `level-${day.stage}` : "empty"}><strong>{day.label}</strong><span>{day.runs || "—"}</span><small>{day.runs ? `${day.runs} ${day.runs === 1 ? "run" : "runs"}` : "No data"}</small></article>)}</div>
              <p className="sample-warning"><strong>Early signal only.</strong> {observedDays.length} exact-date days are not enough to establish a dependable weekday pattern. This view will become more meaningful as attempts accumulate.</p>
            </div>
          </div>
        )}
      </section>

      <section className="insights-grid">
        <article className="insight-card"><p className="eyebrow">Working hypothesis</p><h3>Evening calendars are stale.</h3><p>8:56 PM and 9:26 PM repeatedly reached calendar dates without producing time inventory. They remain visible in the archive, but are removed from the active strategy.</p></article>
        <article className="insight-card"><p className="eyebrow">Current bottleneck</p><h3>Slot acceptance is the frontier.</h3><p>Multiple attempts reached a real time row and the Submit click. The unresolved race is whether the portal accepts that selected inventory before another applicant claims it.</p></article>
        <article className="insight-card protocol"><p className="eyebrow">Recording protocol</p><h3>Five stages. One vocabulary.</h3><ol><li>Calendar loaded</li><li>Time slot appeared</li><li>Submit clicked</li><li>Slot accepted</li><li>Booking completed</li></ol></article>
      </section>

      <footer><span>Chennai Slot Lab · Git-backed experiment</span><span>Unofficial community research · Not affiliated with the U.S. Department of State</span></footer>

      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}>
        <form className="attempt-form" onSubmit={addAttempt} onMouseDown={(e) => e.stopPropagation()}>
          <div className="form-head"><div><p className="eyebrow">New observation</p><h2>Log an attempt</h2></div><button type="button" aria-label="Close form" onClick={() => setShowForm(false)}>×</button></div>
          <label>Date<input name="date" type="date" required value={attemptDate} onChange={(event) => setAttemptDate(event.target.value)} /></label>
          <label>Attempted window<select name="window" required>{windows.map((item) => <option key={item.window}>{item.window}</option>)}</select></label>
          <fieldset><legend>Deepest outcome reached</legend>{Object.entries(outcomeLabels).map(([value, label]) => <label className="radio-row" key={value}><input type="radio" name="outcome" value={value} checked={selectedOutcome === value} onChange={() => setSelectedOutcome(value)} /><span><b>{label}</b><small>Stages before this are recorded as passed.</small></span></label>)}</fieldset>
          <label>Appointment slots seen<input name="slotsSeen" type="number" min="0" max="1000" step="1" placeholder={selectedOutcome === "noCalendar" ? "0" : "Enter the visible count"} /><small className="field-hint">Enter the number shown by the portal. Use 0 when the calendar appeared but no appointment time was listed; leave blank only when the count is unknown.</small></label>
          <label>Notes<textarea name="notes" placeholder="Dates shown, time selected, error message, loading behavior…" rows={3} /></label>
          <p className="git-note">Your entry will open as a prefilled GitHub issue. Review it and click <strong>Submit new issue</strong>; the repository workflow will then validate and store it permanently.</p>
          <div className="form-actions"><button type="button" className="ghost-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit">Continue in GitHub ↗</button></div>
        </form>
      </div>}
    </main>
  );
}
