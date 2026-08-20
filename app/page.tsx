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
  submit: StageState;
  consular: StageState;
  notes: string;
  weight?: number;
  inferred?: boolean;
  sourceUrl?: string;
};

type WindowRow = {
  window: string;
  login: string;
  schedule: string;
  select: string;
  status: "active" | "removed" | "research";
  basis: string;
};

const bundledAttempts = bundledData.attempts as Attempt[];
const gitDataUrl = "https://raw.githubusercontent.com/Balamm27/b1b2-slotbooking/refs/heads/feature/chennai-slot-dashboard/public/data/attempts.json";
const newIssueUrl = "https://github.com/Balamm27/b1b2-slotbooking/issues/new";

const windows: WindowRow[] = [
  { window: "8:56 AM", login: "8:53:30–8:54:30", schedule: "8:55:15–8:55:35", select: "8:55:50–8:56:10", status: "active", basis: "Previously ranked candidate; source verification pending" },
  { window: "10:26 AM", login: "10:23:30–10:24:30", schedule: "10:25:15–10:25:35", select: "10:25:50–10:26:10", status: "active", basis: "Personal miss; earlier ranking retained for comparison" },
  { window: "10:56 AM", login: "10:53:30–10:54:30", schedule: "10:55:15–10:55:35", select: "10:55:50–10:56:10", status: "active", basis: "Personal time-slot hit; Submit lost race" },
  { window: "1:26 PM", login: "1:23:30–1:24:30", schedule: "1:25:15–1:25:35", select: "1:25:50–1:26:10", status: "active", basis: "Confirmed personal time-slot hit; Submit lost the race" },
  { window: "1:56 PM", login: "1:53:30–1:54:30", schedule: "1:55:15–1:55:35", select: "1:55:50–1:56:10", status: "active", basis: "Previously ranked candidate; source verification pending" },
  { window: "2:26 PM", login: "2:23:30–2:24:30", schedule: "2:25:15–2:25:35", select: "2:25:50–2:26:10", status: "active", basis: "Previously ranked candidate; source verification pending" },
  { window: "8:56 PM", login: "8:53:30–8:54:30", schedule: "8:55:15–8:55:35", select: "8:55:50–8:56:10", status: "removed", basis: "Repeated stale calendars; no time rows" },
  { window: "9:26 PM", login: "9:23:30–9:24:30", schedule: "9:25:15–9:25:35", select: "9:25:50–9:26:10", status: "removed", basis: "Stale calendar; alert-only evidence" },
  { window: "6:56 AM", login: "6:53:30–6:54:30", schedule: "6:55:15–6:55:35", select: "6:55:50–6:56:10", status: "research", basis: "Delayed alert only; no confirmed booking" },
  { window: "7:26 AM", login: "7:23:30–7:24:30", schedule: "7:25:15–7:25:35", select: "7:25:50–7:26:10", status: "research", basis: "Delayed alert only; no confirmed booking" },
  { window: "9:26 AM", login: "9:23:30–9:24:30", schedule: "9:25:15–9:25:35", select: "9:25:50–9:26:10", status: "research", basis: "Delayed alert only; no confirmed booking" },
  { window: "11:26 AM", login: "11:23:30–11:24:30", schedule: "11:25:15–11:25:35", select: "11:25:50–11:26:10", status: "research", basis: "Delayed alert only; removed from ranking" },
];

const outcomeMap: Record<string, Pick<Attempt, "calendar" | "time" | "submit" | "consular">> = {
  noCalendar: { calendar: "fail", time: "pending", submit: "pending", consular: "pending" },
  calendarOnly: { calendar: "pass", time: "fail", submit: "pending", consular: "pending" },
  timeFound: { calendar: "pass", time: "pass", submit: "fail", consular: "pending" },
  submitPassed: { calendar: "pass", time: "pass", submit: "pass", consular: "fail" },
  consularReached: { calendar: "pass", time: "pass", submit: "pass", consular: "pass" },
};

const outcomeLabels: Record<string, string> = {
  noCalendar: "No calendar",
  calendarOnly: "Calendar, no time",
  timeFound: "Time found, Submit failed",
  submitPassed: "Submit passed",
  consularReached: "Consular step reached",
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
  const [activeTab, setActiveTab] = useState<"windows" | "attempts">("windows");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${gitDataUrl}?v=${Date.now()}`, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Git data unavailable");
        return response.json();
      })
      .then((data: { attempts?: Attempt[] }) => {
        if (!Array.isArray(data.attempts)) throw new Error("Invalid Git data");
        setAttempts(data.attempts);
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
  const submitHits = weightedCount(attempts, (a) => a.submit === "pass");
  const consularHits = weightedCount(attempts, (a) => a.consular === "pass");

  const filteredWindows = windows.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const haystack = `${item.window} ${item.basis} ${item.status}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  });

  function addAttempt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const outcome = String(form.get("outcome"));
    const next = {
      date: String(form.get("date")),
      window: String(form.get("window")),
      selectWindow: String(form.get("window")),
      ...outcomeMap[outcome],
      notes: String(form.get("notes") || outcomeLabels[outcome]),
    };
    const body = [
      "<!-- chennai-slot-attempt:v1",
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
          <p className="hero-copy">Track the full race—from the VAC dropdown to the consular calendar. No magic times, just observed outcomes.</p>
        </div>
        <div className="hero-score">
          <span>Deepest stage reached</span>
          <strong>Time slot</strong>
          <div className="score-track"><i style={{ width: "54%" }} /></div>
          <small>Submit lost the race once</small>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Experiment summary">
        <article><span>Total observed runs</span><strong>{total}</strong><small>Weighted repeated reports</small></article>
        <article><span>Calendar appeared</span><strong>{conversion(calendarHits)}%</strong><small>{calendarHits} of {total} attempts</small></article>
        <article><span>Time row appeared</span><strong>{conversion(timeHits)}%</strong><small>{timeHits} of {total} attempts</small></article>
        <article className="danger-card"><span>Submit survived</span><strong>{conversion(submitHits)}%</strong><small>{submitHits} confirmed reservations</small></article>
      </section>

      <section className="funnel-panel">
        <div className="section-heading">
          <div><p className="eyebrow">Conversion funnel</p><h2>Where luck runs out</h2></div>
          <span className="updated">Updated Aug 20, 2026</span>
        </div>
        <div className="funnel">
          {[
            ["Chennai queried", total, "100%"],
            ["Calendar dates", calendarHits, `${conversion(calendarHits)}%`],
            ["Time inventory", timeHits, `${conversion(timeHits)}%`],
            ["Submit accepted", submitHits, `${conversion(submitHits)}%`],
            ["Consular page", consularHits, `${conversion(consularHits)}%`],
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
          </div>
          {activeTab === "windows" && <div className="filters">
            <input aria-label="Search windows" placeholder="Search windows…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select aria-label="Filter status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All statuses</option><option value="active">Active</option><option value="removed">Removed</option><option value="research">Research only</option>
            </select>
          </div>}
        </div>

        {activeTab === "windows" ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Window</th><th>Login range</th><th>Schedule click</th><th>Select Chennai</th><th>Runs</th><th>Calendar</th><th>Time</th><th>Status</th><th>Evidence</th></tr></thead>
              <tbody>{filteredWindows.map((item) => {
                const related = attempts.filter((a) => a.window.toLowerCase() === item.window.toLowerCase());
                const runs = weightedCount(related, () => true);
                const cal = weightedCount(related, (a) => a.calendar === "pass");
                const times = weightedCount(related, (a) => a.time === "pass");
                return <tr key={item.window} className={item.status === "removed" ? "muted-row" : ""}>
                  <td><strong>{item.window}</strong><small>Pacific</small></td><td>{item.login}</td><td>{item.schedule}</td><td className="select-time">{item.select}</td><td>{runs || "—"}</td><td>{runs ? `${Math.round(cal / runs * 100)}%` : "—"}</td><td>{runs ? `${Math.round(times / runs * 100)}%` : "—"}</td><td><span className={`status-chip ${item.status}`}>{item.status}</span></td><td className="evidence-cell">{item.basis}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        ) : (
          <div className="attempt-list">
            <div className="attempt-head"><span>Date / window</span><span>Calendar</span><span>Time</span><span>Submit</span><span>Consular</span><span>Observation</span></div>
            {attempts.map((attempt) => <article className="attempt-row" key={attempt.id}>
              <div><strong>{attempt.window}</strong><span>{attempt.date}{attempt.weight ? ` · ${attempt.weight}× runs` : ""}{attempt.inferred ? " · verify date" : ""}</span></div>
              <StatusMark state={attempt.calendar} /><StatusMark state={attempt.time} /><StatusMark state={attempt.submit} /><StatusMark state={attempt.consular} />
              <p>{attempt.notes}{attempt.sourceUrl && <a className="source-link" href={attempt.sourceUrl} target="_blank" rel="noreferrer">GitHub record ↗</a>}</p>
            </article>)}
          </div>
        )}
      </section>

      <section className="insights-grid">
        <article className="insight-card"><p className="eyebrow">Working hypothesis</p><h3>Evening calendars are stale.</h3><p>8:56 PM and 9:26 PM repeatedly reached calendar dates without producing time inventory. They remain visible in the archive, but are removed from the active strategy.</p></article>
        <article className="insight-card"><p className="eyebrow">Current bottleneck</p><h3>Submit is the new frontier.</h3><p>The 10:56 AM slab reached a real time row. The next experiment should measure the interval from selecting the time to pressing Submit—not add more speculative windows.</p></article>
        <article className="insight-card protocol"><p className="eyebrow">Recording protocol</p><h3>Five stages. One vocabulary.</h3><ol><li>Chennai selected</li><li>Calendar appeared</li><li>Time row appeared</li><li>Submit accepted</li><li>Consular page reached</li></ol></article>
      </section>

      <footer><span>Chennai Slot Lab · Git-backed experiment</span><span>Unofficial community research · Not affiliated with the U.S. Department of State</span></footer>

      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}>
        <form className="attempt-form" onSubmit={addAttempt} onMouseDown={(e) => e.stopPropagation()}>
          <div className="form-head"><div><p className="eyebrow">New observation</p><h2>Log an attempt</h2></div><button type="button" aria-label="Close form" onClick={() => setShowForm(false)}>×</button></div>
          <label>Date<input name="date" type="date" required defaultValue="2026-08-20" /></label>
          <label>Attempted window<select name="window" required>{windows.map((item) => <option key={item.window}>{item.window}</option>)}</select></label>
          <fieldset><legend>Deepest outcome reached</legend>{Object.entries(outcomeLabels).map(([value, label], index) => <label className="radio-row" key={value}><input type="radio" name="outcome" value={value} defaultChecked={index === 0} /><span><b>{label}</b><small>Stages before this are recorded as passed.</small></span></label>)}</fieldset>
          <label>Notes<textarea name="notes" placeholder="Dates shown, time selected, error message, loading behavior…" rows={3} /></label>
          <p className="git-note">Your entry will open as a prefilled GitHub issue. Review it and click <strong>Submit new issue</strong>; the repository workflow will then validate and store it permanently.</p>
          <div className="form-actions"><button type="button" className="ghost-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit">Continue in GitHub ↗</button></div>
        </form>
      </div>}
    </main>
  );
}
