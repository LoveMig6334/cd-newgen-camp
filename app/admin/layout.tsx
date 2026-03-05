import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | CDSC Admin",
  },
};

// Passthrough layout — auth is handled by app/admin/(protected)/layout.tsx
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
