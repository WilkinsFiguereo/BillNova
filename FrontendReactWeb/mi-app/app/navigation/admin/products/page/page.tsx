import { Metadata } from "next";
import AdminProductsPage from "@/features/admin/products/AdminProductsPage";

export const metadata: Metadata = {
  title: "Moderación de Productos",
  description:
    "Gestiona los productos registrados en la plataforma, revisa su informacion y toma decisiones de moderacion.",
};

export default function Page() {
  return <AdminProductsPage />;
}
