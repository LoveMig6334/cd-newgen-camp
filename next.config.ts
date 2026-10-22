import type { NextConfig } from "next";
import { PITCH_PATH } from "./lib/pitch";
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
    // Short links for QR codes / the projector.
    return [
      { source: "/prompt-battle", destination: PROMPT_BATTLE_PATH, permanent: false },
      { source: "/wheel", destination: "/admin/wheel", permanent: false },
      { source: "/pitch", destination: PITCH_PATH, permanent: false },
      { source: "/chaser", destination: "/admin/chaser", permanent: false },
    ];
  },
};

export default nextConfig;
