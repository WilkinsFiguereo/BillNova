import type { Metadata } from "next";
import { ServiciosPage } from "@/features/seller/services";

export const metadata: Metadata = {
  title: "Servicios",
};

export default function Page() {
  return <ServiciosPage />;
}
