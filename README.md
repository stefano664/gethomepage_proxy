# Homepage Proxy

Proxy HTTP modulare per [Homepage (gethomepage.dev)](https://gethomepage.dev).  
Espone i dati di servizi esterni come endpoint JSON, pronti per il widget `customapi`.

---

## Struttura

```
homepage-proxy/
├── server.js                    ← core HTTP, routing /api/:provider
├── registry.js                  ← abilita/disabilita i provider
├── providers/
│   ├── base.js                  ← classe astratta BaseProvider
│   ├── hetzner-s3.js            ← Hetzner Object Storage (S3-compatible)
│   └── template-example.js      ← template per nuovi provider
├── package.json
├── docker-compose.yml
└── homepage-services.yaml       ← snippet per Homepage
```

---

## Endpoint disponibili

| Metodo | Path | Descrizione |
|--------|------|-------------|
| `GET` | `/health` | Health check + lista provider attivi |
| `GET` | `/api` | Lista provider con endpoint |
| `GET` | `/api/:provider` | Dati del provider specificato |

---

## Aggiungere un nuovo provider

### 1. Crea il file provider

```js
// providers/mio-servizio.js
import { BaseProvider } from "./base.js";

export class MioServizioProvider extends BaseProvider {
  constructor() {
    super("mio-servizio", {
      url:   process.env.MIOSERVIZIO_URL   || "",
      token: process.env.MIOSERVIZIO_TOKEN || "",
    });
  }

  async fetch() {
    this.assertConfig(["url", "token"]);

    const res  = await fetch(`${this.config.url}/stats`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
    const data = await res.json();

    return {
      provider: this.name,
      // ...i tuoi campi
    };
  }
}
```

### 2. Registralo in `registry.js`

```js
import { MioServizioProvider } from "./providers/mio-servizio.js";

const PROVIDERS = [
  new HetznerS3Provider(),
  new MioServizioProvider(),   // ← aggiunto
];
```

### 3. Aggiungi le variabili d'ambiente in `docker-compose.yml`

```yaml
MIOSERVIZIO_URL:   "https://api.mioservizio.com"
MIOSERVIZIO_TOKEN: "il_mio_token"
```

### 4. Aggiungi il widget in Homepage `services.yaml`

```yaml
- Categoria:
    - Mio Servizio:
        widget:
          type: customapi
          url: http://homepage-proxy:3456/api/mio-servizio
          mappings:
            - field: campo_uno
              label: Etichetta
              format: number
```

---

## Provider inclusi

### `hetzner-s3`
Calcola spazio usato/libero/percentuale di un bucket Hetzner Object Storage.

| Variabile | Descrizione |
|-----------|-------------|
| `HETZNER_ENDPOINT` | URL endpoint S3 (es. `https://fsn1.your-objectstorage.com`) |
| `HETZNER_REGION` | Regione (default: `eu-central`) |
| `HETZNER_ACCESS_KEY` | Access Key S3 |
| `HETZNER_SECRET_KEY` | Secret Key S3 |
| `HETZNER_BUCKET` | Nome del bucket |
| `HETZNER_QUOTA_GB` | Quota massima in GB (default: `1024`) |

Risposta:
```json
{
  "provider":  "hetzner-s3",
  "bucket":    "my-bucket",
  "used_gb":   123.45,
  "free_gb":   900.55,
  "total_gb":  1024,
  "used_pct":  12.1,
  "objects":   4521
}
```
