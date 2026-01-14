/** @type {import('next').NextConfig} */
module.exports = {
  output: "standalone",
  turbopack: { root: __dirname },
  allowedDevOrigins: [
    "http://10.0.0.141",
    "http://localhost",
    "http://127.0.0.1",
  ],
};
