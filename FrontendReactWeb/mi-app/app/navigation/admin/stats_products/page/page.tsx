import { Metadata } from "next";
import { EstadisticasProductosPage } from "../../../../../src/features/moderator/stats_product_moderation/EstadisticasProductosPage";

export const metadata: Metadata = {
  title: "Estadisticas de Productos",
  description: "Panel de estadisticas de productos para administracion.",
};

export default function Page() {
  return <EstadisticasProductosPage />;
}
