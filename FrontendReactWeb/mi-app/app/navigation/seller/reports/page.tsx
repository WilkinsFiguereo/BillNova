import { SharedReportsPage } from "@/features/shared/reports/SharedReportsPage";
import { ReportsSidebar } from "@/features/shared/reports/ReportsSidebar";

export default function Page() {
  return (
    <SharedReportsPage
      sidebar={
        <ReportsSidebar
          backHref="/navigation/seller/dashboard/page"
          backLabel="Volver al Dashboard"
        />
      }
    />
  );
}