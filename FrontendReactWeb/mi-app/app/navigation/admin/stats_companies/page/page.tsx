import { Metadata } from "next";
import { EstadisticasEmpresasPage } from "../../../../../src/features/moderator/stats_company_moderation/EstadisticasEmpresaPage";

export const metadata: Metadata = {
  title: "Estadisticas de Empresas",
  description: "Panel de estadisticas de empresas para administracion.",
};

export default function Page() {
  return <EstadisticasEmpresasPage />;
}
