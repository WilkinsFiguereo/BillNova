export type ReportKind = "user" | "seller" | "bug";

export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type ReportStatus = "open" | "seen" | "in-progress" | "resolved" | "closed";

export type UserIssueCategory =
  | "damaged"
  | "not-received"
  | "late"
  | "wrong-item"
  | "quality-issue"
  | "other";

export type SellerIssueCategory =
  | "payment-not-received"
  | "payment-mismatch"
  | "payout-delay"
  | "chargeback"
  | "other";

export type BugCategory =
  | "bug"
  | "feature"
  | "ui"
  | "performance"
  | "security"
  | "other";

export type ReportCategory = UserIssueCategory | SellerIssueCategory | BugCategory;

export interface Report {
  id: string;
  kind: ReportKind;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id?: string;
    name: string;
    email?: string;
    role?: string;
  };
  notes?: string;
}

export interface CreateReportInput {
  kind: ReportKind;
  category: ReportCategory;
  severity: ReportSeverity;
  title: string;
  description: string;
  reporter: Report["reporter"];
}

export interface UpdateReportInput {
  status?: ReportStatus;
  severity?: ReportSeverity;
  category?: ReportCategory;
  title?: string;
  description?: string;
  notes?: string;
}
