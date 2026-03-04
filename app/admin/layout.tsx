// Passthrough layout — auth is handled by app/admin/(protected)/layout.tsx
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
