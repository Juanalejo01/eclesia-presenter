/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El binario portable se sirve desde GitHub Releases. Si no hay release publicado
  // /releases/latest devuelve 404, así que apuntamos a la página de releases general.
  async redirects() {
    return [
      {
        source: '/download/latest',
        destination: 'https://github.com/Juanalejo01/eclesia-presenter/releases',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
