"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Filter, X } from "lucide-react";
import { recordsApi, type RecordFilters } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Card, Badge, Button, Modal, Input, Select, Textarea, Spinner, ToastContainer,
} from "@/components/ui";
import { formatINR } from "@/lib/utils";
import type { PaginatedRecords, RecordType, RecordCategory } from "@/types";

const CATEGORIES: RecordCategory[] = [
  "salary", "revenue", "investment", "operations",
  "marketing", "infrastructure", "payroll", "tax", "compliance", "other",
];

export default function RecordsPage() {
  const { token, isAnalyst } = useAuth();
  const { toasts, toast } = useToast();

  const [data, setData] = useState<PaginatedRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: "", type: "income" as RecordType, category: "revenue" as RecordCategory,
    record_date: new Date().toISOString().split("T")[0],
    description: "", reference_number: "",
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const filters: RecordFilters = { page, page_size: 15 };
      if (filterType) filters.type = filterType as RecordType;
      if (filterCat) filters.category = filterCat as RecordCategory;
      if (filterFrom) filters.date_from = filterFrom;
      if (filterTo) filters.date_to = filterTo;
      const res = await recordsApi.list(token, filters);
      setData(res);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to load records", "error");
    } finally {
      setLoading(false);
    }
  }, [token, page, filterType, filterCat, filterFrom, filterTo]);

  useEffect(() => { load(); }, [load]);

  function clearFilters() {
    setFilterType(""); setFilterCat(""); setFilterFrom(""); setFilterTo("");
    setPage(1);
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm(`Archive record #${id}? It won't be permanently deleted.`)) return;
    try {
      await recordsApi.delete(token, id);
      toast("Record archived");
      load();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !form.amount || !form.record_date) {
      toast("Amount and date are required", "error"); return;
    }
    setSubmitting(true);
    try {
      await recordsApi.create(token, {
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        record_date: form.record_date,
        description: form.description || undefined,
        reference_number: form.reference_number || undefined,
      });
      toast("Record created");
      setAddOpen(false);
      setForm({ amount: "", type: "income", category: "revenue",
        record_date: new Date().toISOString().split("T")[0], description: "", reference_number: "" });
      load();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Create failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const hasFilters = filterType || filterCat || filterFrom || filterTo;

  return (
    <>
      <div className="animate-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Financial Records</h1>
            <p className="text-sm text-slate-500 mt-0.5">All income and expense entries</p>
          </div>
          {isAnalyst && (
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus size={14} className="mr-1.5" /> Add Record
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input
            type="date" value={filterFrom}
            onChange={e => { setFilterFrom(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="From"
          />
          <input
            type="date" value={filterTo}
            onChange={e => { setFilterTo(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={12} className="mr-1" /> Clear
            </Button>
          )}

          {data && (
            <span className="ml-auto flex items-center text-xs text-slate-500">
              <Filter size={12} className="mr-1.5" />
              {data.total} record{data.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Date", "Type", "Category", "Description", "Ref #", "Amount", ""].map(h => (
                    <th key={h} className={`px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center"><Spinner className="mx-auto" /></td></tr>
                ) : !data?.items.length ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-600 text-sm">No records found</td></tr>
                ) : data.items.map(r => (
                  <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.record_date}</td>
                    <td className="px-5 py-3"><Badge variant={r.type}>{r.type}</Badge></td>
                    <td className="px-5 py-3 text-xs text-slate-400 capitalize">{r.category}</td>
                    <td className="px-5 py-3 text-xs text-slate-400 max-w-[180px] truncate">{r.description || "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{r.reference_number || "—"}</td>
                    <td className={`px-5 py-3 text-right font-mono text-sm font-medium ${r.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {formatINR(r.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isAnalyst && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-xs text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-500/30 px-2 py-1 rounded"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                Page {data.page} of {data.total_pages} · {data.total} total
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                <Button size="sm" variant="ghost" disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add Record Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Financial Record">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (₹)" type="number" min="0.01" step="0.01"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="10000" required />
            <Input label="Date" type="date"
              value={form.record_date} onChange={e => setForm(f => ({ ...f, record_date: e.target.value }))}
              required />
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as RecordType }))}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as RecordCategory }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <Input label="Reference # (optional)" value={form.reference_number}
            onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))}
            placeholder="INV-2026-001" />
          <Textarea label="Description (optional)" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description..." />
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create Record"}
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} />
    </>
  );
}
