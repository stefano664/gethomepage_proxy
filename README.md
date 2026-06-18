# Homepage Proxy

<p align="center">
  <img src="img/logo.png" alt="Homepage Proxy logo" width="120" />
</p>

A modular HTTP proxy for [Homepage (gethomepage.dev)](https://gethomepage.dev).  
Exposes data from external services as JSON endpoints, ready for the `customapi` widget.

---

## Structure

```
homepage-proxy/
├── server.js                    ← HTTP core, routing /api/:provider
├── registry.js                  ← enable/disable providers
├── providers/
│   ├── base.js                  ← abstract BaseProvider class
│   └── hetzner-s3.js            ← Hetzner Object Storage (S3-compatible)
├── template-example.js          ← template to copy when adding a new provider
├── img/
│   └── logo.png
├── Dockerfile
├── .dockerignore
├── package.json
├── docker-compose.yml
└── homepage-services.yaml       ← snippet for Homepage
```

---

## Available endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check + list of active providers |
| `GET` | `/api` | List of providers with endpoints |
| `GET` | `/api/:provider` | Data for the specified provider |

---

## Adding a new provider

### 1. Create the provider file

```js
// providers/my-service.js
import { BaseProvider } from "./base.js";

export class MyServiceProvider extends BaseProvider {
  constructor() {
    super("my-service", {
      url:   process.env.MYSERVICE_URL   || "",
      token: process.env.MYSERVICE_TOKEN || "",
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
      // ...your fields
    };
  }
}
```

### 2. Register it in `registry.js`

```js
import { MyServiceProvider } from "./providers/my-service.js";

const PROVIDERS = [
  new HetznerS3Provider(),
  new MyServiceProvider(),   // ← added
];
```

### 3. Add environment variables in `docker-compose.yml`

```yaml
MYSERVICE_URL:   "https://api.myservice.com"
MYSERVICE_TOKEN: "my_token"
```

### 4. Add the widget in Homepage `services.yaml`

```yaml
- Category:
    - My Service:
        widget:
          type: customapi
          url: http://homepage-proxy:3456/api/my-service
          mappings:
            - field: field_one
              label: Label
              format: number
```

---

## Included providers

### `hetzner-s3`
Calculates used/free space and percentage for a Hetzner Object Storage bucket.

| Variable | Description |
|----------|-------------|
| `HETZNER_ENDPOINT` | S3 endpoint URL (e.g. `https://fsn1.your-objectstorage.com`) |
| `HETZNER_REGION` | Region (default: `eu-central`) |
| `HETZNER_ACCESS_KEY` | S3 Access Key |
| `HETZNER_SECRET_KEY` | S3 Secret Key |
| `HETZNER_BUCKET` | Bucket name |
| `HETZNER_QUOTA_GB` | Maximum quota in GB (default: `1024`) |

Response:
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
