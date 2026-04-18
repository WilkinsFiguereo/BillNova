import type { Metadata } from "next";
import CompaniesPage from "@/features/admin/companies/page";

export const metadata: Metadata = {
  title: "Empresas",
  description: "Panel de administracion de empresas.",
};

export default function Page() {
  return <CompaniesPage />;
}
