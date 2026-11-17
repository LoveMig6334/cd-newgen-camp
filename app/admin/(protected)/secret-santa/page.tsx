import type { Metadata } from "next";
import SecretSantaAdmin from "./SecretSantaAdmin";

export const metadata: Metadata = { title: "Secret Santa" };

export default function AdminSecretSantaPage() {
  return <SecretSantaAdmin />;
}
