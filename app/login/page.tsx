"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@finvault.io");
  const [password, setPassword] = useState("Admin@1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login(email, password);
      login(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-emerald-950/30 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-slate-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 leading-none">FinVault</h1>
            <p className="text-xs text-slate-500 mt-0.5">Compliant Finance Dashboard</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Sign in</h2>
            <p className="text-xs text-slate-500 mt-0.5">Access your finance dashboard</p>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-500/30 rounded-lg px-3 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@finvault.io"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button variant="primary" type="submit" disabled={loading} className="w-full mt-1">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Seeded credentials hint */}
        <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-2">Test accounts</p>
          {[
            { email: "admin@finvault.io", pass: "Admin@1234", role: "admin" },
            { email: "analyst@finvault.io", pass: "Analyst@1234", role: "analyst" },
            { email: "viewer@finvault.io", pass: "Viewer@1234", role: "viewer" },
          ].map(a => (
            <button
              key={a.role}
              onClick={() => { setEmail(a.email); setPassword(a.pass); }}
              className="block w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
            >
              <span className="text-[10px] font-mono text-emerald-400">{a.email}</span>
              <span className="text-[10px] text-slate-600 ml-2 capitalize">({a.role})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
