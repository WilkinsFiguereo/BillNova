import type { Metadata } from "next";
import { UsersPage } from "../../../../src/features/admin/users/UsersPage";

export const metadata: Metadata = { title: "Usuarios" };

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <UsersPage />
    </main>
  );
}