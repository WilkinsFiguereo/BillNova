import { Metadata } from "next";
import CategoriaPage from "@/features/admin/category/page";

export const metadata: Metadata = {
  title: "Categorías - Administrador",
  description: "Gestión de categorías de productos.",
}

export default function Page() {
    return <CategoriaPage />
}