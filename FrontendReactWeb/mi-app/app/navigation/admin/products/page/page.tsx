import { Metadata } from "next";
import AdminProductsPage from "@/features/admin/products/AdminProductsPage";

export const metadata: Metadata = {
  title: "Productos Admin",
  description:
    "Gestiona los productos de la plataforma, crea categorías y revisa la lista de productos registrados.",
};

export default function Page() {
  return <AdminProductsPage />;
}
