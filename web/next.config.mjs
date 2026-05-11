/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Los binarios se sirven desde GitHub Releases.
  // - /download/installer → setup.exe (recomendado)
  // - /download/portable  → portable.exe
  // - /download/latest    → página de releases (fallback)
  async redirects() {
    const tag = 'v0.2.0'
    const base = 'https://github.com/Juanalejo01/eclesia-presenter/releases'
    return [
      {
        source: '/download/installer',
        destination: `${base}/download/${tag}/EclesiaPresenter-0.2.0-setup.exe`,
        permanent: false,
      },
      {
        source: '/download/portable',
        destination: `${base}/download/${tag}/EclesiaPresenter-0.2.0-portable.exe`,
        permanent: false,
      },
      {
        source: '/download/latest',
        destination: `${base}/latest`,
        permanent: false,
      },
    ]
  },
}

export default nextConfig
