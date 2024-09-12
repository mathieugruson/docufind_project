/** @type {import('next').NextConfig} */

const nextConfig = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.node$/,
        use: 'node-loader',
      });
      config.resolve.alias.canvas = false;
      return config;
    },
  };

export default nextConfig;
