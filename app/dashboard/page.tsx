"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import { MetricCard, Card, Badge, Spinner, ToastContainer } from "@/components/ui";
import { formatINR, formatDate } from "@/lib/utils";
import type { DashboardSummary } from "@/types";

const COLORS = ["#22d3a5", "#f1504a", "#4a9eff", "#a78bfa", "#f5a623", "#5dcaa5", "#d85a30", "#378add"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="font-mono font-medium" style={{ color: p.name === "income" ? "#22d3a5" : "#f1504a" }}>
            {p.name}: {formatINR(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { token } = useAuth();
  const { toasts, toast } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    dashboardApi.summary(token)
      .then(setData)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!data) return null;

  const trendData = data.monthly_trends.map((m) => ({
    name: `${m.month_label} ${m.year}`,
    income: Number(m.income),
    expense: Number(m.expense),
  }));

  const pieData = (data.expense_by_category.length
    ? data.expense_by_category
    : data.income_by_category
  ).map((c) => ({ name: c.category, value: Number(c.total) }));

  const netPositive = Number(data.net_balance) >= 0;

  return (
    <>
      <div className="animate-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Financial overview & analytics</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Total Income"
            value={formatINR(data.total_income)}
            sub={`${data.income_by_category.length} categories`}
            accent="green"
          />
          <MetricCard
            label="Total Expense"
            value={formatINR(data.total_expense)}
            sub={`${data.expense_by_category.length} categories`}
            accent="red"
          />
          <MetricCard
            label="Net Balance"
            value={formatINR(data.net_balance)}
            sub={netPositive ? "Surplus" : "Deficit"}
            accent={netPositive ? "green" : "red"}
          />
          <MetricCard
            label="Total Records"
            value={String(data.record_count)}
            sub="Financial entries"
            accent="blue"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Monthly trend bar chart */}
          <Card className="lg:col-span-2 p-5">
            <p className="text-sm font-semibold text-slate-100 mb-0.5">Monthly Trends</p>
            <p className="text-xs text-slate-500 mb-4">Income vs expense by month</p>
            {trendData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No trend data yet</div>
            ) : (
              <div className="flex gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Income
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />Expense
                </span>
              </div>
            )}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barGap={2}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="income" fill="#22d3a5" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#f1504a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Category donut chart */}
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-100 mb-0.5">Expense Breakdown</p>
            <p className="text-xs text-slate-500 mb-4">By category</p>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                    dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(v) => <span style={{ fontSize: 11, color: "#94a3b8" }}>{v}</span>}
                    iconSize={8} iconType="square"
                  />
                  <Tooltip formatter={(v) => formatINR(Number(v))}
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Recent activity */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-100">Recent Activity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="px-5 py-3 text-right text-[11px] font-medium text-slate-500 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_activity.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-600 text-sm">No records yet</td></tr>
                ) : data.recent_activity.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.record_date}</td>
                    <td className="px-5 py-3"><Badge variant={r.type}>{r.type}</Badge></td>
                    <td className="px-5 py-3 text-xs text-slate-400 capitalize">{r.category}</td>
                    <td className="px-5 py-3 text-xs text-slate-400 max-w-[200px] truncate">{r.description || "—"}</td>
                    <td className={`px-5 py-3 text-right font-mono text-sm font-medium ${r.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {formatINR(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}
