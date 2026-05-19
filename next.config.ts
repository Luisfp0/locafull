import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/sobre", destination: "/about", permanent: true },
      { source: "/servicos", destination: "/services", permanent: true },
      {
        source: "/diferenciais",
        destination: "/differentials",
        permanent: true,
      },
      { source: "/contato", destination: "/contact", permanent: true },
      { source: "/pedido", destination: "/order", permanent: true },
    ];
  },
};

export default nextConfig;
