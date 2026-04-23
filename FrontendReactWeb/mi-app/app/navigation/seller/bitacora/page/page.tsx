import { Metadata } from "next";
import BitacoraPage from "@/features/seller/bitacora/page";

export const metadata: Metadata = {
  title: "Bitacora",
  description: "Consulta la actividad registrada del sistema.",
};

export default function Page() {
  return <BitacoraPage />;
}
