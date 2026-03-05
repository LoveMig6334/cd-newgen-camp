import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sukhumvit = localFont({
  src: [
    {
      path: "../public/Fonts/SukhumvitSet-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/Fonts/SukhumvitSet-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/Fonts/SukhumvitSet-Text.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Fonts/SukhumvitSet-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/Fonts/SukhumvitSet-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/Fonts/SukhumvitSet-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sukhumvit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CD Smart Campus",
    template: "%s | CD Smart Campus",
  },
  description: "แพลตฟอร์มระบบบริการนักเรียนออนไลน์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${sukhumvit.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
