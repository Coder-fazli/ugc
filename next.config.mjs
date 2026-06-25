/** @type {import('next').NextConfig} */
const nextConfig = {
  // googleapis is a server-only Node library; keep it out of the bundler.
  serverExternalPackages: ["googleapis"],
};

export default nextConfig;
