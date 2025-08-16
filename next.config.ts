import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.glb$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]',
            outputPath: 'static/models/',
            publicPath: '/_next/static/models/',
          },
        },
      ],
    });
    return config;
  }
};

export default nextConfig;
