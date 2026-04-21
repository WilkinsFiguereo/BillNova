export type ReportCategory = 'bug' | 'feature' | 'ui' | 'performance' | 'security' | 'other' | 'damaged' | 'not-received' | 'late' | 'wrong-item' | 'quality-issue';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category: ReportCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
