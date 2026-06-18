/**
 * registry.js – registro dei provider abilitati
 *
 * Per abilitare un provider:
 *   1. Importa la sua classe
 *   2. Aggiungila alla lista PROVIDERS
 *
 * Il core legge questo file all'avvio e monta automaticamente
 * un endpoint  GET /api/<provider.name>  per ciascun provider.
 */

import { HetznerS3Provider }       from "./providers/hetzner-s3.js";
// import { TemplateExampleProvider } from "./providers/template-example.js";
// import { ProxmoxProvider }         from "./providers/proxmox.js";
// import { UptimeKumaProvider }      from "./providers/uptime-kuma.js";
// import { PlexProvider }            from "./providers/plex.js";

const PROVIDERS = [
  new HetznerS3Provider(),
  // new TemplateExampleProvider(),
];

/**
 * Costruisce una mappa  name → provider  per lookup O(1).
 * @returns {Map<string, import("./providers/base.js").BaseProvider>}
 */
export function buildRegistry() {
  const map = new Map();
  for (const p of PROVIDERS) {
    if (map.has(p.name)) {
      throw new Error(`Registro: nome provider duplicato "${p.name}"`);
    }
    map.set(p.name, p);
  }
  return map;
}
