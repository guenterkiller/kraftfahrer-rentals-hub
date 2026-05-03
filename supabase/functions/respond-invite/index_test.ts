import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/respond-invite`;

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
};

function getCall(qs: string, extraHeaders: Record<string, string> = {}) {
  return fetch(`${ENDPOINT}${qs}`, {
    method: "GET",
    redirect: "manual",
    headers: { ...headers, ...extraHeaders },
  });
}

function postCall(body: unknown) {
  return fetch(ENDPOINT, {
    method: "POST",
    redirect: "manual",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

Deno.test("respond-invite: GET is side-effect-free (no status change)", async () => {
  const res = await getCall("?a=accept&t=any-token-xyz");
  assertEquals(res.status, 200);
  const ct = (res.headers.get("content-type") ?? "").toLowerCase();
  assertStringIncludes(ct, "application/json");
  const data = await res.json();
  assertEquals(data.status, "preview");
});

Deno.test("respond-invite: GET with bot User-Agent is also no-op", async () => {
  const res = await getCall("?a=accept&t=any-token-xyz", {
    "User-Agent": "Go-http-client/2.0",
  });
  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.status, "preview");
});

Deno.test("respond-invite: POST with invalid action returns invalid", async () => {
  const res = await postCall({ action: "foo", token: "abc" });
  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.status, "invalid");
});

Deno.test("respond-invite: POST with missing params returns invalid", async () => {
  const res = await postCall({});
  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.status, "invalid");
});

Deno.test("respond-invite: POST with unknown token returns invalid", async () => {
  const res = await postCall({
    action: "accept",
    token: "this-token-does-not-exist-xyz-123",
  });
  assertEquals(res.status, 200);
  const data = await res.json();
  assertEquals(data.status, "invalid");
});

Deno.test("respond-invite: PUT method is rejected with 405", async () => {
  const res = await fetch(ENDPOINT, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: "{}",
  });
  assertEquals(res.status, 405);
  await res.text();
});