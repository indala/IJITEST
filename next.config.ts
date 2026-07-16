import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const storageUrl = process.env['STORAGE_SERVICE_URL'] || "https://api.ijitest.org";
const wsStorageUrl = storageUrl.replace(/^http/, "ws");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self' https://indala.vercel.app",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  `connect-src 'self' https: wss: ${storageUrl} ${wsStorageUrl}`,
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "manifest-src 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  cacheComponents: true,
  allowedDevOrigins: process.env['ALLOWED_DEV_ORIGINS']?.split(',').filter(Boolean) ?? [],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    },
    workerThreads: false,
    cpus: 2
  },
  logging: process.env.NODE_ENV !== "production"
    ? {
      fetches: {
        fullUrl: true,
      },
    }
    : false,

  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/(admin|editor|reviewer|author)/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env['ANALYZE'] === 'true',
});

export default analyzer(nextConfig);
