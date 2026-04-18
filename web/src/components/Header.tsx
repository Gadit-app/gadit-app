"use client";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const { user, logout, promptLogin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold" style={{ color: "#0F172A" }}>
          <span style={{ color: "#2563EB" }}>Gad</span>it
        </Link>

        <Link href="/pricing" className="text-sm text-slate-500 hover:text-blue-600 transition-all">
          Pricing
        </Link>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 hover:opacity-80 transition-all"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: "#2563EB" }}>
                  {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 min-w-40 z-50">
                <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
                  {user.displayName ?? user.email}
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => promptLogin()}
            className="px-4 py-1.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
