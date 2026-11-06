import { withReticle } from '@reticlehq/next';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  webpack(config, { dev }) {
    if (dev) {
      // Reticle writes its session logs to .reticle/ while a tab is connected. If the dev watcher sees
      // those writes it rebuilds, the page refreshes, Reticle logs more, and the page reloads forever.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: /(^|[\\/])(\.git|\.next|\.reticle|node_modules)([\\/]|$)/,
      };
    }
    return config;
  },
};

export default withReticle(nextConfig);
