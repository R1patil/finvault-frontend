"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Spinner } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token && !user) {
      const saved = localStorage.getItem("fv_token");
      if (!saved) router.replace("/login");
    }
  }, [token, user, router]);

  if (!token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
}
