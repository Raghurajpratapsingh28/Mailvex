/**
 * Live smoke test — runs against localhost:4000.
 *
 * API keys only cover event-ingestion endpoints (/track, /identify, /page,
 * /group, /alias). Contacts, campaigns, segments etc. require a JWT obtained
 * via POST /api/v1/auth/login — those are tested separately.
 *
 * Usage:
 *   npx tsx test/smoke-test.ts
 */
import { Mailvex, MailvexError } from "../src/index.js";

const API_KEY      = "eiq_live_0379cf87598ff5c65191443aec4d671fc2c2d533";
const WORKSPACE_ID = "4eb0301b-5a05-42e4-9184-07ffff2d98b1";
const BASE_URL     = "http://localhost:4000";

const client = new Mailvex({ apiKey: API_KEY, workspaceId: WORKSPACE_ID, baseUrl: BASE_URL });

let passed = 0;
let failed = 0;

async function test(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (err) {
    const msg = err instanceof MailvexError
      ? `[${err.code}] ${err.message} (HTTP ${err.statusCode})`
      : String(err);
    console.log(`  ✗  ${label} — ${msg}`);
    failed++;
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

console.log("\n── Mailvex Node SDK smoke test ─────────────────────────────────");
console.log(`   base : ${BASE_URL}`);
console.log(`   key  : ${API_KEY.slice(0, 16)}...`);
console.log(`   ws   : ${WORKSPACE_ID}`);
console.log("─────────────────────────────────────────────────────────────────\n");

// ─── track() ─────────────────────────────────────────────────────────────────
console.log("Events (API key auth)");
await test("track() — returns messageId", async () => {
  const res = await client.events.track({
    event: "sdk_smoke_test",
    userId: "smoke-user-1",
    properties: { source: "smoke-test", ts: Date.now() },
  });
  assert(res.success === true, "success !== true");
  assert(typeof res.messageId === "string", "missing messageId");
});

await test("identify() — returns messageId", async () => {
  const res = await client.events.identify({
    userId: "smoke-user-1",
    traits: { email: "smoke@example.com", plan: "starter" },
  });
  assert(res.success === true, "success !== true");
  assert(typeof res.messageId === "string", "missing messageId");
});

await test("page() — returns messageId", async () => {
  const res = await client.events.page({
    userId: "smoke-user-1",
    name: "Home",
    properties: { url: "http://localhost:3000/home" },
  });
  assert(res.success === true, "success !== true");
  assert(typeof res.messageId === "string", "missing messageId");
});

await test("group() — returns messageId", async () => {
  const res = await client.events.group({
    userId: "smoke-user-1",
    groupId: "org-42",
    traits: { name: "Acme Corp", plan: "enterprise" },
  });
  assert(res.success === true, "success !== true");
  assert(typeof res.messageId === "string", "missing messageId");
});

await test("alias() — returns messageId", async () => {
  const res = await client.events.alias({
    userId: "smoke-user-1",
    previousId: "anon-abc123",
  });
  assert(res.success === true, "success !== true");
  assert(typeof res.messageId === "string", "missing messageId");
});

// ─── Error handling ───────────────────────────────────────────────────────────
console.log("\nError handling");
await test("invalid key → 401 INVALID_WRITE_KEY", async () => {
  const bad = new Mailvex({ apiKey: "eiq_live_bad_key", workspaceId: WORKSPACE_ID, baseUrl: BASE_URL });
  try {
    await bad.events.track({ event: "test", userId: "x" });
    throw new Error("should have thrown");
  } catch (err) {
    assert(err instanceof MailvexError, "not an MailvexError");
    assert(err.statusCode === 401, `expected 401, got ${err.statusCode}`);
    assert(err.code === "INVALID_WRITE_KEY", `expected INVALID_WRITE_KEY, got ${err.code}`);
  }
});

await test("missing event name → 400", async () => {
  try {
    await client.events.track({ event: "", userId: "x" });
    throw new Error("should have thrown");
  } catch (err) {
    assert(err instanceof MailvexError, "not an MailvexError");
    assert(err.statusCode === 400, `expected 400, got ${err.statusCode}`);
  }
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────────────────────────────────");
console.log(`   ${passed} passed  ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : "\x1b[32mall passing\x1b[0m"}`);
if (failed > 0) process.exit(1);
