import { Metadata } from "next";
import { AdminReportsPage } from "@/features/admin/reports/AdminReportsPage";

export const metadata: Metadata = {
  title: "Moderación de Reportes",
  description: "Gestiona los reportes realizados por los usuarios, revisa su información y toma decisiones"
}

export default function Page() {
  return <AdminReportsPage />;
}