/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      fs: {
        browser: "./scripts/empty-node.js",
      },
      path: {
        browser: "./scripts/empty-node.js",
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
