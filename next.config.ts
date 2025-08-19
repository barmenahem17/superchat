import type { NextConfig } from "next";

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    TWELVEDATA_KEY: process.env.TWELVEDATA_KEY,
    FX_NOW: process.env.FX_NOW,
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
