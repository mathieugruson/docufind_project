/**
 * @type {import('next').NextConfig}
 */

//   output: 'export',

const nextConfig = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
        ) => {
            config.resolve.alias.canvas = false;
            config.module.rules.push({
        test: /\.(pdf|gif|png|jpe?g|svg)$/,
        use: 'file-loader?name=[path][name].[ext]',
      });
    return config
  },
}

module.exports = nextConfig
