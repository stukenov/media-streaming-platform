/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
        basePath: false,
        locale: false
      },
      {
        source: '/media-api/:path*',
        destination: 'http://localhost:9997/v3/:path*',
        basePath: false,
        locale: false
      }
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|swf|ogv)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/videos/',
            outputPath: 'static/videos/',
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });
    return config;
  },
  transpilePackages: ['video.js', '@videojs/http-streaming']
}

module.exports = nextConfig