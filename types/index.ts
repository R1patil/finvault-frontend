export type UserRole = "viewer" | "analyst" | "admin";
export type RecordType = "income" | "expense";
export type RecordCategory =
  | "salary" | "revenue" | "investment" | "operations"
  | "marketing" | "infrastructure" | "payroll" | "tax"
  | "compliance" | "other";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface FinancialRecord {
  id: number;
  amount: string;
  type: RecordType;
  category: RecordCategory;
  description: string | null;
  record_date: string;
  reference_number: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedRecords {
  items: FinancialRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CategoryTotal {
  category: string;
  total: string;
  count: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  month_label: string;
  income: string;
  expense: string;
  net: string;
}

export interface RecentRecord {
  id: number;
  amount: string;
  type: string;
  category: string;
  description: string | null;
  record_date: string;
}

export interface DashboardSummary {
  total_income: string;
  total_expense: string;
  net_balance: string;
  record_count: number;
  income_by_category: CategoryTotal[];
  expense_by_category: CategoryTotal[];
  monthly_trends: MonthlyTrend[];
  recent_activity: RecentRecord[];
}

export interface AuditLog {
  id: number;
  actor_id: number;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  payload: Record<string, unknown> | null;
  timestamp: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
