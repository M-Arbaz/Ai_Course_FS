/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '919943607899-ok6np3foh25p1iap4vbp363e07aindt1.apps.googleusercontent.com',
  },

  reactCompiler: true,
};

export default nextConfig;