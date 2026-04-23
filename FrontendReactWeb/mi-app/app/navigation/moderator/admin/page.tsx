import { Metadata } from "next";
import { AdminReportsPage } from "@/features/admin/reports/AdminReportsPage";

export const metadata: Metadata = {
  title: "Reportes del Admin",
  description: "Vista de reportes para el administrador",
};

export default function Page() {
  return <AdminReportsPage />;
}
