/**
 * Provider: Template / Esempio
 *
 * Copia questo file, rinominalo e adattalo per aggiungere un nuovo provider.
 *
 * Passi:
 *   1. Rinomina il file  →  providers/<tuo-provider>.js
 *   2. Rinomina la classe →  <TuoProvider>Provider
 *   3. Imposta un nome univoco nel costruttore (diventa il path /api/<nome>)
 *   4. Definisci le variabili d'ambiente in config
 *   5. Implementa fetch() → restituisce un oggetto JSON
 *   6. Importa e registra in registry.js
 *
 * Endpoint esposto: GET /api/template-example
 */

import { BaseProvider } from "./base.js";

export class TemplateExampleProvider extends BaseProvider {
  constructor() {
    super("template-example", {
      // Leggi le tue variabili d'ambiente qui
      apiUrl:  process.env.MYSERVICE_URL   || "",
      apiKey:  process.env.MYSERVICE_TOKEN || "",
    });
  }

  async fetch() {
    // Valida che i campi obbligatori siano presenti
    this.assertConfig(["apiUrl", "apiKey"]);

    // --- Esegui la tua logica di raccolta dati ---
    // const res = await fetch(`${this.config.apiUrl}/stats`, {
    //   headers: { Authorization: `Bearer ${this.config.apiKey}` },
    // });
    // const data = await res.json();

    // Restituisci sempre un oggetto plain
    return {
      provider: this.name,
      // ...i tuoi campi...
      status: "ok",
      value:  42,
    };
  }
}
