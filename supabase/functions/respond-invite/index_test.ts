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

async function assertRedirect(res: Response, expectedStatusParam: string) {
  await res.body?.cancel();
  assertEquals(res.status, 302);
  const location = res.headers.get("location") ?? "";
  assertStringIncludes(location, "/fahrer-antwort?status=");
  assertStringIncludes(location, `status=${expectedStatusParam}`);
}

Deno.test("respond-invite: invalid action redirects to invalid", async () => {
  const res = await call("?a=foo&t=abc");
  await assertRedirect(res, "invalid");
});

Deno.test("respond-invite: missing params redirects to invalid", async () => {
  const res = await call("");
  await assertRedirect(res, "invalid");
});

Deno.test("respond-invite: unknown token (accept) redirects to invalid", async () => {
  const res = await call("?a=accept&t=this-token-does-not-exist-xyz-123");
  await assertRedirect(res, "invalid");
});

Deno.test("respond-invite: unknown token (decline) redirects to invalid", async () => {
  const res = await call("?a=decline&t=this-token-does-not-exist-xyz-456");
  await assertRedirect(res, "invalid");
});