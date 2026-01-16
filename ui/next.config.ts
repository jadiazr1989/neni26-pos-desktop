/** @type {import('next').NextConfig} */
module.exports = {
  output: "standalone",
  turbopack: { root: __dirname },
  allowedDevOrigins: [
    "http://10.0.0.141",
    "http://localhost",
    "http://127.0.0.1",
  ],
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    return [
      {
        source: "/assets/:path*",
        destination: `${api}/assets/:path*`,
      },
    ];
  },
};
