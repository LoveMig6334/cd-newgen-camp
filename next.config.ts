import type { NextConfig } from "next";
import { FINAL_PROJECT_PATH } from "./lib/finalProject";
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
      // Prototype PITCH submissions are closed; old links land on Final Project.
      { source: "/pitch", destination: FINAL_PROJECT_PATH, permanent: false },
      { source: PITCH_PATH, destination: FINAL_PROJECT_PATH, permanent: false },
      { source: "/final", destination: FINAL_PROJECT_PATH, permanent: false },
      { source: "/chaser", destination: "/admin/chaser", permanent: false },
      { source: "/chaser/display", destination: "/admin/chaser/display", permanent: false },
    ];
  },
};

export default nextConfig;
