import fs from "node:fs";
import path from "node:path";

const issueBody = process.env.ISSUE_BODY ?? "";
const issueNumber = process.env.ISSUE_NUMBER ?? "";
const repository = process.env.GITHUB_REPOSITORY ?? "";
const marker = /<!--\s*chennai-slot-attempt:v(?:1|2)\s*([\s\S]*?)\s*-->/;
const match = issueBody.match(marker);

if (!match) throw new Error("The issue does not contain a Chennai Slot Lab record.");
if (!/^\d+$/.test(issueNumber)) throw new Error("Invalid GitHub issue number.");

const input = JSON.parse(match[1]);
const stages = new Set(["pass", "fail", "pending"]);
const text = (value, name, max) => {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    throw new Error(`Invalid ${name}.`);
  }
  return value.trim();
};

const date = text(input.date, "date", 20);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Date must use YYYY-MM-DD.");

const normalizedStages = "submitClicked" in input
  ? {
      calendar: input.calendar,
      time: input.time,
      submitClicked: input.submitClicked,
      slotAccepted: input.slotAccepted,
      bookingCompleted: input.bookingCompleted,
    }
  : {
      calendar: input.calendar,
      time: input.time,
      submitClicked: input.submit === "pass" || input.submit === "fail" ? "pass" : "pending",
      slotAccepted: input.submit,
      bookingCompleted: "pending",
    };

for (const [stage, state] of Object.entries(normalizedStages)) {
  if (!stages.has(state)) throw new Error(`Invalid ${stage} state.`);
}

const dataPath = path.join(process.cwd(), "public", "data", "attempts.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const id = `github-${issueNumber}`;

if (data.attempts.some((attempt) => attempt.id === id)) {
  console.log(`Attempt ${id} is already recorded.`);
  process.exit(0);
}

data.attempts.unshift({
  id,
  date,
  window: text(input.window, "window", 40),
  selectWindow: text(input.selectWindow, "select window", 60),
  ...normalizedStages,
  notes: text(input.notes, "notes", 1000),
  sourceUrl: `https://github.com/${repository}/issues/${issueNumber}`,
});
data.updatedAt = new Date().toISOString();

fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Recorded ${id}.`);
