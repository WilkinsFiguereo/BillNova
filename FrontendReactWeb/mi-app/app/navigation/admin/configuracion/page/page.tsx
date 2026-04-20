import type { Metadata } from "next";
import { AdminConfigPage } from "@/features/admin/config";

export const metadata: Metadata = {
  title: "Configuracion",
};

export default function Page() {
  return <AdminConfigPage />;
}

