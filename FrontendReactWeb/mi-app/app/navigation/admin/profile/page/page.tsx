import { Metadata } from "next";
import { ProfilePage } from "@/features/admin/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Mi Perfil",
  description: "Gestiona tu información personal y preferencias de cuenta",
};

export default function Page() {
  return <ProfilePage />;
}
