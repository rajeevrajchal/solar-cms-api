export class OtpService {
  generateOtp(
    otpLength: number = 6,
    expiryMinutes: number = 5,
    onlyDigit: boolean = true,
  ): { code: string; otp_expiry: Date } {
    const digits = onlyDigit
      ? '0123456789'
      : '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+';
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }

    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + expiryMinutes);

    return {
      code: otp,
      otp_expiry: otpExpiry,
    };
  }

  isOtpExpired(otpExpiry: Date): boolean {
    const currentDateTime = new Date();
    return currentDateTime > otpExpiry;
  }
}
