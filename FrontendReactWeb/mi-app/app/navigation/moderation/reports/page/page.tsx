import { Metadata } from "next";
import { ReportesPage } from "@/features/moderator/report_moderation/ReportesPage";

export const metadata: Metadata = {
  title: "Moderación de Reportes",
  description: "Gestiona los reportes realizados por los usuarios, revisa su información y toma decisiones"
}

export default function Page() {
  return <ReportesPage />;
}