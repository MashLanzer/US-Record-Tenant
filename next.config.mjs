/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the app can be wrapped natively with Capacitor (iOS/Android)
  // and hosted anywhere as a fast, shareable PWA-style web app.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
