/** @type {import('next').NextConfig} */
// Optional sub-path hosting (e.g. "/helios-maturity-assessment" on github.io/<user>/...).
// Leave NEXT_PUBLIC_BASE_PATH empty when serving from a custom domain root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

module.exports = nextConfig;
