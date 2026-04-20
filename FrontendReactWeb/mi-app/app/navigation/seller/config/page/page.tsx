import type { Metadata } from "next";
import { SellerConfigPage } from "@/features/seller/config";

export const metadata: Metadata = {
  title: "Configuracion",
};

export default function Page() {
  return <SellerConfigPage />;
}

