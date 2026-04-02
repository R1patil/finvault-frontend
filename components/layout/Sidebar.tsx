"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Users, ShieldCheck, LogOut, TrendingUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["viewer", "analyst", "admin"] },
  { href: "/records",   label: "Records",   icon: FileText,        roles: ["viewer", "analyst", "admin"] },
  { href: "/users",     label: "Users",     icon: Users,           roles: ["admin"] },
  { href: "/audit",     label: "Audit Log", icon: ShieldCheck,     roles: ["admin"] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const allowed = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-slate-950 border-r border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-slate-900" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-none">FinVault</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Finance Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {allowed.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-[11px] font-bold flex-shrink-0">
              {initials(user.full_name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user.full_name.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-[11px] text-slate-600 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  );
}
