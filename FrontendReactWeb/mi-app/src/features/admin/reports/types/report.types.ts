export interface Report {
  id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'ui' | 'performance' | 'security' | 'other';
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
  targetType?: 'usuario' | 'empresa';
  targetModel?: 'res.users' | 'billnova.user' | 'res.company';
  targetId?: number;
  targetLabel?: string;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category: Report['category'];
  severity: Report['severity'];
  targetType: 'usuario' | 'empresa';
  targetModel: 'res.users' | 'billnova.user' | 'res.company';
  targetId: number;
  targetLabel?: string;
}
