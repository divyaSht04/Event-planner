import { CreateUserData } from "../models/model-types";

interface OTPData {
  otp: string;
  userData: CreateUserData;
  expiresAt: number;
}

export class OTPService {
  private otpStore: Map<string, OTPData> = new Map();

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOTP(email: string, otp: string, userData: CreateUserData): void {
    const expiresAt = Date.now() + 10 * 60 * 1000;
    this.otpStore.set(email, { otp, userData, expiresAt });

    this.cleanup();
  }

  verifyOTP(email: string, otp: string): CreateUserData | null {
    const otpData = this.otpStore.get(email);

    if (!otpData) {
      return null;
    }

    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(email);
      return null;
    }

    if (otpData.otp === otp) {
      this.otpStore.delete(email);
      return otpData.userData;
    }

    return null;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [email, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }
}