import { Suspense } from "react";
import { default as TermsPage } from "@/features/shared/terms/TermsPage";

function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-secondary)" }}>Cargando...</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <TermsPage />
    </Suspense>
  );
}

