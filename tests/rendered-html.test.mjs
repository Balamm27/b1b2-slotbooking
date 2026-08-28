import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the Chennai Slot Lab dashboard shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Chennai Slot Lab<\/title>/i);
  assert.match(html, /Turn every booking attempt/);
  assert.match(html, /Window board/);
  assert.match(html, /Calendar insights/);
  assert.match(html, /VAC slots/);
  assert.match(html, /10:26 PM/);
  assert.match(html, /4:26 PM/);
  assert.match(html, /11:26 PM/);
  assert.match(html, /VAC Submit/);
  assert.match(html, /VAC accepted/);
  assert.match(html, /Consular calendar/);
  assert.match(html, /Consular time/);
  assert.match(html, /Consular Submit/);
  assert.match(html, /Booking completed/);
  assert.match(html, /window-row status-active/);
  assert.match(html, /window-row status-research/);
  assert.match(html, /window-row status-removed/);
  assert.ok(html.indexOf("6:56 AM") < html.indexOf("12:56 PM"));
  assert.ok(html.indexOf("12:56 PM") < html.indexOf("3:28 PM"));
  assert.ok(html.indexOf("3:28 PM") < html.indexOf("11:26 PM"));
  assert.match(html, /Syncing with Git/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
