// AES-256-GCM encryption for sensitive values (Instagram access tokens, etc.)
// Server-side only — never import this in client components.
//
// Generate ENCRYPTION_KEY with: openssl rand -hex 32
// The key must be exactly 64 hex characters (32 bytes).

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) throw new Error("ENCRYPTION_KEY environment variable is not set");
  if (keyHex.length !== 64)
    throw new Error("ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)");
  return Buffer.from(keyHex, "hex");
}

// Returns "ivHex:authTagHex:encryptedHex"
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // GCM recommended: 12 bytes
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const key = getKey();
  const parts = encryptedData.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted data format");

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
