/**
 * BaseProvider – classe astratta da cui ereditano tutti i provider.
 *
 * Per aggiungere un nuovo provider:
 *   1. Crea providers/<nome>.js
 *   2. Estendi BaseProvider
 *   3. Implementa `fetch()` → restituisce un oggetto JSON serializzabile
 *   4. Registralo in registry.js
 *
 * Il nome del provider (this.name) diventa il path dell'endpoint:
 *   GET /api/<name>  →  chiama provider.fetch()
 */
export class BaseProvider {
  /**
   * @param {string} name   - identificatore univoco, usato come path URL
   * @param {object} config - configurazione specifica del provider (da env o argomento)
   */
  constructor(name, config = {}) {
    if (new.target === BaseProvider) {
      throw new Error("BaseProvider è astratta: non istanziarla direttamente.");
    }
    this.name   = name;
    this.config = config;
  }

  /**
   * Esegue la raccolta dati e restituisce un oggetto plain da serializzare come JSON.
   * @returns {Promise<Record<string, unknown>>}
   */
  async fetch() {
    throw new Error(`${this.constructor.name} deve implementare fetch().`);
  }

  /**
   * Validazione di base: verifica che i campi obbligatori siano presenti in config.
   * Chiamato dal core prima di ogni fetch().
   * @param {string[]} required - lista di chiavi obbligatorie
   */
  assertConfig(required = []) {
    const missing = required.filter((k) => !this.config[k]);
    if (missing.length) {
      throw new Error(
        `[${this.name}] Configurazione incompleta. Campi mancanti: ${missing.join(", ")}`
      );
    }
  }
}
