const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "payu.in",
      },
      {
        protocol: "https",
        hostname: "cwatch.comodo.com",
      },
    ],
  },
};

export default nextConfig;