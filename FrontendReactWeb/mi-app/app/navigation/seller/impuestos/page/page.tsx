import { Metadata } from "next";
import ImpuestosPage from "@/features/seller/impuestos/page";

export const metadata: Metadata = {
  title: "Impuestos",
  description: "Gestiona los impuestos de tu empresa.",
};

export default function Page() {
  return <ImpuestosPage />;
}
