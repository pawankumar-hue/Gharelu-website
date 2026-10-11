/** @type {import('next').NextConfig} */
// BACKEND_API_URL points at the store API. Local dev defaults to port 5000;
// production (e.g. Render) injects the live backend URL so same-origin /api
// calls — and first-party auth cookies — keep working unchanged.
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // 1. Proxy ALL backend API routes to the dedicated backend server
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      // 2. SPA fallback for client-side routing
      {
        source: '/((?!api|_next/static|_next/image|images|favicon|fonts).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
