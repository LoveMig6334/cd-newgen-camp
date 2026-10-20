import type { NextConfig } from "next";
import { PROMPT_BATTLE_PATH } from "./lib/promptBattle";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
  async redirects() {
    // Short link for the Prompt Battle QR code.
    return [
      { source: "/prompt-battle", destination: PROMPT_BATTLE_PATH, permanent: false },
    ];
  },
};

export default nextConfig;
