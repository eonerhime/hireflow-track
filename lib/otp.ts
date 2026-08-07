import { randomInt } from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function otpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}
