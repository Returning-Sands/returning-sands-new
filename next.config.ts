import type { NextConfig } from "next";

// cacheComponents must stay off: dynamic = "error" (root layout) depends on the classic rendering model.
const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
