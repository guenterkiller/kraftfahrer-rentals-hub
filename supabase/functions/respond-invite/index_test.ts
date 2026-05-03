import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/respond-invite`;

async function call(qs: string): Promise<Response> {
  return await fetch(`${ENDPOINT}${qs}`, {
    redirect: "manual",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });
}

async function assertText(res: Response, expectedSnippet: string) {
  assertEquals(res.status, 200);
  const ct = res.headers.get("content-type") ?? "";
  assertStringIncludes(ct.toLowerCase(), "text/plain");
  assertStringIncludes(ct.toLowerCase(), "charset=utf-8");
  const body = await res.text();
  assertStringIncludes(body, expectedSnippet);
}

Deno.test("respond-invite: invalid action returns plain text", async () => {
  const res = await call("?a=foo&t=abc");
  await assertText(res, "ungültig");
});

Deno.test("respond-invite: missing params returns plain text", async () => {
  const res = await call("");
  await assertText(res, "ungültig");
});

Deno.test("respond-invite: unknown token (accept) returns plain text", async () => {
  const res = await call("?a=accept&t=this-token-does-not-exist-xyz-123");
  await assertText(res, "ungültig");
});

Deno.test("respond-invite: unknown token (decline) returns plain text", async () => {
  const res = await call("?a=decline&t=this-token-does-not-exist-xyz-456");
  await assertText(res, "ungültig");
});