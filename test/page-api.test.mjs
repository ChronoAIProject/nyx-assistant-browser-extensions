import test from "node:test";
import assert from "node:assert/strict";
import { accessPageRegistry, readDescriptors } from "../extension/page-api.js";

const metadata = { name: "get_release", description: "Read version", parameters: { release: "string", details: "boolean" } };
test("discovery is inert and Chrome dictionary key order does not affect approval", async () => {
  const href = "https://example.test/guide";
  globalThis.location = { href };
  globalThis.document = { visibilityState: "visible" };
  let calls = 0;
  const tool = { ...metadata, execute({ release }) { ++calls; return { version: release }; } };
  globalThis.window = { nyxPageAPI: { version: 1, tools: [tool] } };
  const found = await accessPageRegistry(href);
  assert.deepEqual(readDescriptors(found.metadata), [metadata]);
  assert.equal(calls, 0);
  const approved = { description: metadata.description, name: metadata.name, parameters: { details: "boolean", release: "string" } };
  const args = { release: "0.3", details: true };
  assert.deepEqual(await accessPageRegistry(href, approved, args), { value: '{"version":"0.3"}' });
  tool.description = "Different operation";
  assert.deepEqual(await accessPageRegistry(href, approved, args), { error: "apiGone" });
  tool.description = metadata.description;
  document.visibilityState = "hidden";
  assert.deepEqual(await accessPageRegistry(href, approved, args), { error: "apiGone" });
  document.visibilityState = "visible";
  location.href += "/another";
  assert.deepEqual(await accessPageRegistry(href, approved, args), { error: "apiGone" });
  assert.equal(calls, 1);
});

test("malformed and ambiguous site declarations fail validation", () => {
  for (const tools of [
    [metadata, metadata], [{ ...metadata, name: "constructor" }],
    [{ ...metadata, parameters: { prototype: "string" } }],
    [{ ...metadata, parameters: { query: "function" } }],
    [{ ...metadata, description: "x".repeat(513) }],
    Array.from({ length: 17 }, (_, index) => ({ ...metadata, name: "tool" + index })),
  ]) {
    assert.throws(() => readDescriptors(JSON.stringify(tools)));
  }
});
