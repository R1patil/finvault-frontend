"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Card, Badge, Spinner, ToastContainer } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog } from "@/types";

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "REGISTER", "ROLE_CHANGE", "STATUS_CHANGE"];
const RESOURCES = ["financial_record", "user"];

export default function AuditPage() {
  const { token, isAdmin } = useAuth();
  const { toasts, toast } = useToast();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) { router.replace("/dashboard"); return; }
  }, [isAdmin, router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await dashboardApi.auditLogs(token, {
        action: filterAction || undefined,
        resource_type: filterResource || undefined,
        limit: 100,
      });
      setLogs(res);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  }, [token, filterAction, filterResource]);

  useEffect(() => { load(); }, [load]);

  const actionColor: Record<string, string> = {
    CREATE: "CREATE", UPDATE: "UPDATE", DELETE: "DELETE",
    LOGIN: "LOGIN", REGISTER: "REGISTER",
    ROLE_CHANGE: "ROLE_CHANGE", STATUS_CHANGE: "STATUS_CHANGE",
  };

  return (
    <>
      <div className="animate-in">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">Audit Log</h1>
          </div>
          <p className="text-sm text-slate-500">Immutable record of every system action — append-only, never modified</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select
            value={filterResource}
            onChange={e => setFilterResource(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All resources</option>
            {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <span className="ml-auto flex items-center text-xs text-slate-500">
            {logs.length} entr{logs.length !== 1 ? "ies" : "y"}
          </span>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Timestamp</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Actor</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Action</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Resource</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Payload</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center"><Spinner className="mx-auto" /></td></tr>
                ) : !logs.length ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-600 text-sm">No audit entries</td></tr>
                ) : logs.map(log => (
                  <>
                    <tr
                      key={log.id}
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-300">
                        {log.actor_email || `#${log.actor_id}`}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={actionColor[log.action] || log.action}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 capitalize">
                        {log.resource_type.replace("_", " ")}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">
                        {log.resource_id || "—"}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 max-w-[200px] truncate">
                        {log.payload ? JSON.stringify(log.payload).slice(0, 50) + (JSON.stringify(log.payload).length > 50 ? "…" : "") : "—"}
                      </td>
                    </tr>
                    {/* Expanded payload row */}
                    {expanded === log.id && log.payload && (
                      <tr key={`${log.id}-expanded`} className="bg-slate-950/50">
                        <td colSpan={6} className="px-5 py-3">
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2 font-medium">Payload</p>
                            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="text-xs text-slate-700 mt-4 text-center">
          Click any row to inspect the full payload diff
        </p>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}
