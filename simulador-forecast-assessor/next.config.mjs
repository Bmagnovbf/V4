/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Remove o prefixo "node:" dos imports (node:fs → fs) para que o fallback abaixo funcione
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '')
        })
      )

      // Módulos Node.js sem equivalente no browser → módulos vazios
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        http: false,
        crypto: false,
        stream: false,
        path: false,
        url: false,
        os: false,
        zlib: false,
        net: false,
        tls: false,
        dns: false,
        querystring: false,
        buffer: false,
      }
    }
    return config
  },
}

export default nextConfig
