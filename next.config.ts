import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "/:path*",
      },
      {
        source: "/products/sonost-3000",
        destination: "/san-pham/sonost-3000",
      },
      {
        source: "/products/sonost-3000/3d-viewer",
        destination: "/san-pham/sonost-3000/3d-viewer",
      },
      {
        source: "/products/sonost-3000/exploded-view",
        destination: "/san-pham/sonost-3000/exploded-view",
      },
      {
        source: "/services/rental",
        destination: "/dich-vu-cho-thue",
      },
      {
        source: "/services/repairs",
        destination: "/dich-vu-sua-chua",
      },
      {
        source: "/quote",
        destination: "/bao-gia",
      },
      {
        source: "/admin/dashboard",
        destination: "/admin",
      },
      {
        source: "/admin/leasing",
        destination: "/admin/thue-may",
      },
      {
        source: "/admin/repairs",
        destination: "/admin/sua-chua",
      },
      {
        source: "/admin/inventory",
        destination: "/admin/kho-thiet-bi",
      },
      {
        source: "/admin/customers",
        destination: "/admin/khach-hang",
      },
      {
        source: "/admin/settings",
        destination: "/admin/cai-dat",
      },
    ];
  },
};

export default nextConfig;
