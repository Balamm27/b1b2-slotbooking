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
  assert.match(html, /Slots seen/);
  assert.match(html, /10:26 PM/);
  assert.match(html, /4:26 PM/);
  assert.match(html, /Submit clicked/);
  assert.match(html, /Slot accepted/);
  assert.match(html, /Booking completed/);
  assert.match(html, /Syncing with Git/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
