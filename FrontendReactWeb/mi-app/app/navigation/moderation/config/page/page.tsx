import type { Metadata } from "next";
import { ModeratorConfigPage } from "@/features/moderator/config";

export const metadata: Metadata = {
  title: "Configuracion",
};

export default function Page() {
  return <ModeratorConfigPage />;
}

