import { Metadata } from "next";
import { ReportesPage } from "@/features/moderator/report_moderation/ReportesPage";

export const metadata: Metadata = {
  title: "Reportes del Moderador",
  description: "Vista de reportes para el moderador",
};

export default function Page() {
  return <ReportesPage />;
}
