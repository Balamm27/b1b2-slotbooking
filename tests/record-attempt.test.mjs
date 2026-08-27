import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const projectRoot = new URL("..", import.meta.url);

function runIntake(body, issueNumber) {
  const result = spawnSync(process.execPath, ["scripts/record-attempt.mjs"], {
    cwd: runIntake.directory,
    encoding: "utf8",
    env: {
      ...process.env,
      ISSUE_BODY: body,
      ISSUE_NUMBER: String(issueNumber),
      GITHUB_REPOSITORY: "Balamm27/b1b2-slotbooking",
    },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test("normalizes legacy intake and stores the full VAC-to-consular funnel", () => {
  const directory = mkdtempSync(join(tmpdir(), "chennai-slot-intake-"));
  runIntake.directory = directory;
  try {
    mkdirSync(join(directory, "scripts"), { recursive: true });
    mkdirSync(join(directory, "public", "data"), { recursive: true });
    copyFileSync(new URL("scripts/record-attempt.mjs", projectRoot), join(directory, "scripts", "record-attempt.mjs"));
    copyFileSync(new URL("public/data/attempts.json", projectRoot), join(directory, "public", "data", "attempts.json"));

    runIntake('<!-- chennai-slot-attempt:v1 {"date":"2026-08-21","window":"10:56 AM","selectWindow":"10:55:50–10:56:10 AM","calendar":"pass","time":"pass","submit":"fail","consular":"pending","notes":"v1 test"} -->', 901);
    runIntake('<!-- chennai-slot-attempt:v2 {"date":"2026-08-21","window":"1:26 PM","selectWindow":"1:25:50–1:26:10 PM","calendar":"pass","time":"pass","submitClicked":"pass","slotAccepted":"fail","bookingCompleted":"pending","slotsSeen":2,"notes":"v2 test"} -->', 902);
    runIntake('<!-- chennai-slot-attempt:v3 {"date":"2026-08-27","window":"2:26 PM","selectWindow":"2:25:50–2:26:10 PM","calendar":"pass","time":"pass","submitClicked":"pass","slotAccepted":"pass","consularCalendar":"fail","consularTime":"pending","consularSubmitClicked":"pending","bookingCompleted":"pending","slotsSeen":1,"consularSlotsSeen":0,"notes":"v3 test"} -->', 903);

    const data = JSON.parse(readFileSync(join(directory, "public", "data", "attempts.json"), "utf8"));
    for (const id of ["github-901", "github-902"]) {
      const attempt = data.attempts.find((item) => item.id === id);
      assert.equal(attempt.submitClicked, "pass");
      assert.equal(attempt.slotAccepted, "fail");
      assert.equal(attempt.bookingCompleted, "pending");
      assert.equal(attempt.consularCalendar, "pending");
      assert.equal(attempt.consularTime, "pending");
      assert.equal(attempt.consularSubmitClicked, "pending");
    }
    assert.equal(data.attempts.find((item) => item.id === "github-901").slotsSeen, undefined);
    assert.equal(data.attempts.find((item) => item.id === "github-902").slotsSeen, 2);
    const v3 = data.attempts.find((item) => item.id === "github-903");
    assert.equal(v3.slotAccepted, "pass");
    assert.equal(v3.consularCalendar, "fail");
    assert.equal(v3.consularTime, "pending");
    assert.equal(v3.consularSubmitClicked, "pending");
    assert.equal(v3.consularSlotsSeen, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
