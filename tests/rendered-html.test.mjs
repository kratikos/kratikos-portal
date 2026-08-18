import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../.vercel/output/", import.meta.url);

async function getApplication() {
  const serverUrl = new URL(
    "functions/__server.func/index.mjs",
    outputRoot,
  );
  serverUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: application } = await import(serverUrl.href);
  return application;
}

test("gera uma saída compatível com a Vercel", async () => {
  const config = JSON.parse(
    await readFile(new URL("config.json", outputRoot), "utf8"),
  );

  assert.equal(config.version, 3);
  assert.equal(config.framework.name, "nitro");
  assert.ok(config.routes.some((route) => route.dest === "/__server"));
});

test("renderiza o portal administrativo no domínio de produção", async () => {
  const application = await getApplication();
  const response = await application.fetch(
    new Request("https://portal.kratikos.com.br/", {
      headers: { accept: "text/html" },
    }),
    { waitUntil() {} },
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Portal administrativo \| Kratikos/i);
  assert.match(html, /Validando acesso administrativo/i);
  assert.match(html, /https:\/\/portal\.kratikos\.com\.br/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("informa sessão não autenticada quando não há cookie", async () => {
  const application = await getApplication();
  const response = await application.fetch(
    new Request("https://portal.kratikos.com.br/api/admin/session"),
    { waitUntil() {} },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    authenticated: false,
  });
});
