import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [kind, salt, hex] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hex) return false;
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}
