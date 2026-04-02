import type {
  TokenResponse, User, FinancialRecord, PaginatedRecords,
  DashboardSummary, AuditLog, RecordType, RecordCategory, UserRole,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://finvault-eik2.onrender.com";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    request<User>("/api/v1/auth/me", {}, token),
};

// ── Records ───────────────────────────────────────────────────
export interface RecordFilters {
  type?: RecordType;
  category?: RecordCategory;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  page_size?: number;
}

export const recordsApi = {
  list: (token: string, filters: RecordFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.append(k, String(v));
    });
    return request<PaginatedRecords>(`/api/v1/records?${params}`, {}, token);
  },

  create: (
    token: string,
    data: {
      amount: number;
      type: RecordType;
      category: RecordCategory;
      record_date: string;
      description?: string;
      reference_number?: string;
    }
  ) =>
    request<FinancialRecord>("/api/v1/records", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (token: string, id: number, data: Partial<{
    amount: number; type: RecordType; category: RecordCategory;
    record_date: string; description: string; reference_number: string;
  }>) =>
    request<FinancialRecord>(`/api/v1/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  delete: (token: string, id: number) =>
    request<{ message: string }>(`/api/v1/records/${id}`, {
      method: "DELETE",
    }, token),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  summary: (token: string) =>
    request<DashboardSummary>("/api/v1/dashboard/summary", {}, token),

  auditLogs: (token: string, filters: { action?: string; resource_type?: string; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.append(k, String(v));
    });
    return request<AuditLog[]>(`/api/v1/dashboard/audit-logs?${params}`, {}, token);
  },
};

// ── Users ─────────────────────────────────────────────────────
export const usersApi = {
  list: (token: string, filters: { role?: UserRole } = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    return request<User[]>(`/api/v1/users?${params}`, {}, token);
  },

  create: (token: string, data: {
    email: string; full_name: string; password: string; role: UserRole;
  }) =>
    request<User>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (token: string, id: number, data: { role?: UserRole; is_active?: boolean; full_name?: string }) =>
    request<User>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),
};

export { ApiError };
