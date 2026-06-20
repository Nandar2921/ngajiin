/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        assert: false,
        child_process: false,
        worker_threads: false,
        "onnxruntime-node": false,
      };
    }

    config.module.rules.push({
      test: /\.node$/,
      use: 'null-loader',
    });

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^onnxruntime-node$/,
      })
    );

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node', '@xenova/transformers'],
  },
  // Hapus @xenova/transformers dari sini karena sudah ada di atas
  transpilePackages: [],
};

export default nextConfig;