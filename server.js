/**
 * server.js – core HTTP del proxy Homepage
 *
 * Routing:
 *   GET /api/:provider   →  chiama provider.fetch(), risponde JSON
 *   GET /api             →  lista di tutti i provider registrati (health check)
 *   GET /health          →  { status: "ok" }
 *
 * Non toccare questo file per aggiungere nuovi provider:
 * modifica solo registry.js (e aggiungi il file in providers/).
 */

import http    from "http";
import { buildRegistry } from "./registry.js";

const PORT     = Number(process.env.PORT || 3456);
const registry = buildRegistry();

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type":                "application/json",
    "Access-Control-Allow-Origin": "*",
    "Content-Length":              Buffer.byteLength(body),
  });
  res.end(body);
}

function parseRoute(url) {
  const clean = url.split("?")[0].replace(/\/$/, "") || "/";
  return clean;
}

// ── Request handler ───────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const route = parseRoute(req.url);

  // Health check
  if (route === "/health") {
    return json(res, 200, { status: "ok", providers: [...registry.keys()] });
  }

  // Lista provider
  if (route === "/api") {
    const list = [...registry.keys()].map((name) => ({
      name,
      endpoint: `/api/${name}`,
    }));
    return json(res, 200, { providers: list });
  }

  // /api/:provider
  const match = route.match(/^\/api\/([^/]+)$/);
  if (match) {
    const name     = match[1];
    const provider = registry.get(name);

    if (!provider) {
      return json(res, 404, {
        error:      "Provider non trovato",
        requested:  name,
        available:  [...registry.keys()],
      });
    }

    try {
      const data = await provider.fetch();
      return json(res, 200, data);
    } catch (err) {
      console.error(`[${name}] Errore durante fetch():`, err.message);
      return json(res, 500, { error: err.message, provider: name });
    }
  }

  // 404 generico
  return json(res, 404, { error: "Route non trovata", path: route });
}

// ── Avvio ─────────────────────────────────────────────────────────────────────

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n✅  Homepage Proxy in ascolto su http://localhost:${PORT}`);
  console.log(`   Provider registrati:`);
  for (const name of registry.keys()) {
    console.log(`     • GET /api/${name}`);
  }
  console.log(`   Health check: GET /health\n`);
});
