import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' remains for the inline theme-flash-prevention script
      // in app/layout.tsx — a nonce-based CSP would remove the need for it,
      // but that requires broadening middleware.ts's matcher to run on every
      // route (it currently only covers /dashboard/* and /api/*), which is
      // riskier to touch than the value justifies right now. There is no
      // dangerouslySetInnerHTML with user-controlled data anywhere in the
      // app, so this does not currently expose a real injection point.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // Added res.cloudinary.com and lh3.googleusercontent.com for avatars
      "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
      "font-src 'self'",
      // Added api.cloudinary.com for the upload POST request
      "connect-src 'self' https://api.cloudinary.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
