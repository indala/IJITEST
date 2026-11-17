import crypto from "crypto";

const PAYMENT_TOKEN_SECRET = process.env["NEXTAUTH_SECRET"] || "ijitest-payment-secure-fallback-key-2026";

/**
 * Generate a deterministic HMAC-SHA256 payment token for a manuscript and author email.
 * This allows authors receiving acceptance emails to complete APC payment without requiring
 * an interactive NextAuth session.
 */
export function generatePaymentToken(paperId: string, email: string): string {
    const normalizedPaperId = (paperId || "").trim().toUpperCase();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const data = `apc_payment:${normalizedPaperId}:${normalizedEmail}`;
    return crypto.createHmac("sha256", PAYMENT_TOKEN_SECRET).update(data).digest("hex").slice(0, 32);
}

/**
 * Verify if the supplied payment token matches the manuscript and author email.
 */
export function verifyPaymentToken(paperId: string, email: string, token: string): boolean {
    if (!token || !paperId || !email) return false;
    const expected = generatePaymentToken(paperId, email);
    try {
        const expectedBuf = Buffer.from(expected);
        const tokenBuf = Buffer.from(token);
        if (expectedBuf.length !== tokenBuf.length) return false;
        return crypto.timingSafeEqual(expectedBuf, tokenBuf);
    } catch {
        return false;
    }
}
