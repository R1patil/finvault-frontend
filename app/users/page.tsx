"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserCheck, UserX } from "lucide-react";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Card, Badge, Button, Modal, Input, Select, Spinner, ToastContainer,
} from "@/components/ui";
import { formatDate, initials } from "@/lib/utils";
import type { User, UserRole } from "@/types";

export default function UsersPage() {
  const { token, isAdmin, user: me } = useAuth();
  const { toasts, toast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("");

  // Create modal
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "viewer" as UserRole });

  useEffect(() => {
    if (!isAdmin) { router.replace("/dashboard"); return; }
  }, [isAdmin, router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const filters: { role?: UserRole } = {};
      if (filterRole) filters.role = filterRole as UserRole;
      const res = await usersApi.list(token, filters);
      setUsers(res);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [token, filterRole]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(u: User) {
    if (!token) return;
    try {
      await usersApi.update(token, u.id, { is_active: !u.is_active });
      toast(`User ${u.is_active ? "deactivated" : "activated"}`);
      load();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Update failed", "error");
    }
  }

  async function handleRoleChange(u: User, role: UserRole) {
    if (!token) return;
    try {
      await usersApi.update(token, u.id, { role });
      toast("Role updated");
      load();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Update failed", "error");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await usersApi.create(token, form);
      toast("User created");
      setAddOpen(false);
      setForm({ full_name: "", email: "", password: "", role: "viewer" });
      load();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Create failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const avatarColors: Record<UserRole, string> = {
    admin:   "bg-violet-500/15 text-violet-400",
    analyst: "bg-blue-500/15 text-blue-400",
    viewer:  "bg-slate-500/15 text-slate-400",
  };

  return (
    <>
      <div className="animate-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100">User Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage users and role assignments</p>
          </div>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} className="mr-1.5" /> Add User
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <span className="text-xs text-slate-500 ml-auto">{users.length} user{users.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["User", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center"><Spinner className="mx-auto" /></td></tr>
                ) : !users.length ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-600 text-sm">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    {/* Avatar + Name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColors[u.role]}`}>
                          {initials(u.full_name)}
                        </div>
                        <span className="text-sm text-slate-200 font-medium">
                          {u.full_name}
                          {u.id === me?.id && <span className="ml-2 text-[10px] text-slate-600">(you)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{u.email}</td>

                    {/* Inline role change dropdown */}
                    <td className="px-5 py-3">
                      {u.id === me?.id ? (
                        <Badge variant={u.role}>{u.role}</Badge>
                      ) : (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u, e.target.value as UserRole)}
                          className="bg-transparent border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="viewer">viewer</option>
                          <option value="analyst">analyst</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <Badge variant={u.is_active ? "active" : "inactive"}>
                        {u.is_active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>

                    {/* Toggle active */}
                    <td className="px-5 py-3">
                      {u.id !== me?.id && (
                        <button
                          onClick={() => handleToggle(u)}
                          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-all ${
                            u.is_active
                              ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                              : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {u.is_active
                            ? <><UserX size={11} /> Deactivate</>
                            : <><UserCheck size={11} /> Activate</>
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Full Name" value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            placeholder="Rahul Patil" required />
          <Input label="Email" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="rahul@company.com" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Password" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 8 chars" required />
            <Select label="Role" value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} />
    </>
  );
}
