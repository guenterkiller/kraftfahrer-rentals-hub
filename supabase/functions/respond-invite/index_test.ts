import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/respond-invite`;

async function call(qs: string): Promise<Response> {
  return await fetch(`${ENDPOINT}${qs}`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });
}

async function assertHtml(res: Response, expectedSnippet: string) {
  const ct = res.headers.get("content-type") ?? "";
  const body = await res.text();
  assertStringIncludes(ct.toLowerCase(), "text/html");
  assertStringIncludes(ct.toLowerCase(), "charset=utf-8");
  assert(body.trimStart().startsWith("<!DOCTYPE html>"), "body must start with <!DOCTYPE html>");
  assertStringIncludes(body, "<html");
  assertStringIncludes(body, "</html>");
  assertStringIncludes(body, expectedSnippet);
}

Deno.test("respond-invite: invalid action returns rendered HTML", async () => {
  const res = await call("?a=foo&t=abc");
  assertEquals(res.status, 200);
  await assertHtml(res, "Ungueltiger Link");
});

Deno.test("respond-invite: missing params returns rendered HTML", async () => {
  const res = await call("");
  assertEquals(res.status, 200);
  await assertHtml(res, "Ungueltiger Link");
});

Deno.test("respond-invite: unknown token (accept) returns rendered HTML", async () => {
  const res = await call("?a=accept&t=this-token-does-not-exist-xyz-123");
  assertEquals(res.status, 200);
  await assertHtml(res, "Einladung nicht gefunden");
});

Deno.test("respond-invite: unknown token (decline) returns rendered HTML", async () => {
  const res = await call("?a=decline&t=this-token-does-not-exist-xyz-456");
  assertEquals(res.status, 200);
  await assertHtml(res, "Einladung nicht gefunden");
});

Deno.test("respond-invite: response sets nosniff header", async () => {
  const res = await call("?a=accept&t=nosniff-check");
  await res.text();
  assertEquals(res.headers.get("x-content-type-options"), "nosniff");
});