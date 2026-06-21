import { randomBytes } from "crypto";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SPECIAL = "!@#$%&*";
const ALL = UPPER + LOWER + DIGITS + SPECIAL;

/** Generates a one-time password that satisfies the platform password policy. */
export function generateTemporaryPassword(length = 16): string {
  const minLen = Math.max(length, 12);
  const required = [
    UPPER[randomBytes(1)[0]! % UPPER.length],
    LOWER[randomBytes(1)[0]! % LOWER.length],
    DIGITS[randomBytes(1)[0]! % DIGITS.length],
    SPECIAL[randomBytes(1)[0]! % SPECIAL.length],
  ];
  const bytes = randomBytes(minLen - required.length);
  const rest = Array.from(bytes, (b) => ALL[b % ALL.length]);
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0]! % (i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}
