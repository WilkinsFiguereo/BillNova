import type { Metadata } from "next";
import { AdminReportsPage } from "@/features/admin/reports/AdminReportsPage";

export const metadata: Metadata = {
  title: "Reportes",
  description: "Gestiona los reportes de la plataforma con datos reales.",
};

export default function Page() {
  return <AdminReportsPage />;
}
