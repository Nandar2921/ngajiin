/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Abaikan file .node di client-side
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
    
    // Tambahkan rule untuk file .node (abaikan)
    config.module.rules.push({
      test: /\.node$/,
      use: 'null-loader',
    });
    
    // Ignore onnxruntime-node completely
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^onnxruntime-node$/,
      })
    );
    
    return config;
  },
  // Agar tidak error saat build
  serverExternalPackages: ['onnxruntime-node', '@xenova/transformers'],
  // Transpile packages yang perlu
  transpilePackages: ['@xenova/transformers'],
};

export default nextConfig;