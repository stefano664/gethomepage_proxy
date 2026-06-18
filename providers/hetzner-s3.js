/**
 * Provider: Hetzner Object Storage (S3-compatible)
 *
 * Variabili d'ambiente richieste:
 *   HETZNER_ENDPOINT    – es. https://fsn1.your-objectstorage.com
 *   HETZNER_REGION      – es. eu-central
 *   HETZNER_ACCESS_KEY  – Access Key S3
 *   HETZNER_SECRET_KEY  – Secret Key S3
 *   HETZNER_BUCKET      – nome del bucket
 *   HETZNER_QUOTA_GB    – quota massima in GB (non esposta via API, default 1024)
 *
 * Endpoint esposto: GET /api/hetzner-s3
 *
 * Risposta:
 * {
 *   "provider":   "hetzner-s3",
 *   "bucket":     "my-bucket",
 *   "used_gb":    123.45,
 *   "free_gb":    900.55,
 *   "total_gb":   1024,
 *   "used_pct":   12.1,
 *   "objects":    4521
 * }
 */

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { BaseProvider } from "./base.js";

export class HetznerS3Provider extends BaseProvider {
  constructor() {
    super("hetzner-s3", {
      endpoint:   process.env.HETZNER_ENDPOINT   || "",
      region:     process.env.HETZNER_REGION      || "eu-central",
      accessKey:  process.env.HETZNER_ACCESS_KEY  || "",
      secretKey:  process.env.HETZNER_SECRET_KEY  || "",
      bucket:     process.env.HETZNER_BUCKET       || "",
      quotaGB:    Number(process.env.HETZNER_QUOTA_GB || 1024),
    });
  }

  async fetch() {
    this.assertConfig(["endpoint", "accessKey", "secretKey", "bucket"]);

    const client = new S3Client({
      endpoint:    this.config.endpoint,
      region:      this.config.region,
      credentials: {
        accessKeyId:     this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: true,
    });

    let sizeBytes   = 0;
    let objectCount = 0;
    let token;

    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket:            this.config.bucket,
          ContinuationToken: token,
        })
      );
      for (const obj of res.Contents ?? []) {
        sizeBytes   += obj.Size ?? 0;
        objectCount += 1;
      }
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);

    const usedGB  = this.#toGB(sizeBytes);
    const totalGB = this.config.quotaGB;

    return {
      provider:  this.name,
      bucket:    this.config.bucket,
      used_gb:   usedGB,
      free_gb:   parseFloat((totalGB - usedGB).toFixed(2)),
      total_gb:  totalGB,
      used_pct:  parseFloat(((usedGB / totalGB) * 100).toFixed(1)),
      objects:   objectCount,
    };
  }

  #toGB(bytes) {
    return parseFloat((bytes / 1_073_741_824).toFixed(2));
  }
}
