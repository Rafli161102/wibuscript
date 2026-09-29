/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      fs: {
        browser: "./scripts/empty-node.js",
      },
      "node:fs": {
        browser: "./scripts/empty-node.js",
      },
      path: {
        browser: "./scripts/empty-node.js",
      },
      "node:path": {
        browser: "./scripts/empty-node.js",
      },
      child_process: {
        browser: "./scripts/empty-node.js",
      },
      "node:child_process": {
        browser: "./scripts/empty-node.js",
      },
      module: {
        browser: "./scripts/empty-node.js",
      },
      "node:module": {
        browser: "./scripts/empty-node.js",
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        "node:fs": false,
        path: false,
        "node:path": false,
        child_process: false,
        "node:child_process": false,
        module: false,
        "node:module": false,
      };
    }
    return config;
  },
};

export default nextConfig;
