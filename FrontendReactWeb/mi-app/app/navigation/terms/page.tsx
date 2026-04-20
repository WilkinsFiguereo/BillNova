import { Suspense } from "react";
import { default as TermsPage } from "@/features/shared/terms/TermsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TermsPage />
    </Suspense>
  );
}

