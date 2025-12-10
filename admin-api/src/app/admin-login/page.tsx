"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "Login failed");
        return;
      }

      if (json.user.role !== "ADMIN") {
        setError("You are not an admin");
        return;
      }

      // TODO later: store json.token in cookie/localStorage
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* small brand header */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-xs font-extrabold text-black">GL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">
              Gold Live Admin
            </p>
            <p className="text-xs text-slate-400">
              Secure access for administrators
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-6 shadow-xl shadow-black/40 space-y-5"
        >
          {/* subtle glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.08),transparent_55%)]" />
          <div className="relative space-y-1">
            <h1 className="text-xl font-semibold text-center">
              Admin Login
            </h1>
            <p className="text-xs text-slate-400 text-center">
              Use your admin credentials to enter the dashboard.
            </p>
          </div>

          {/* Username / Email */}
          <div className="relative space-y-1">
            <label className="text-xs text-slate-300">
              Username or email
            </label>
            <input
              className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="admin"
            />
          </div>

          {/* Password with show/hide */}
          <div className="relative space-y-1">
            <label className="text-xs text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 pr-10 text-sm outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="relative text-xs text-red-400 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative mt-1 w-full rounded-lg bg-yellow-400 text-slate-950 py-2 text-sm font-semibold shadow-md shadow-yellow-500/40 disabled:opacity-60 disabled:shadow-none transition hover:bg-yellow-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="relative text-[10px] text-slate-500 text-center mt-1">
            Tip: dev admin is{" "}
            <span className="font-medium text-slate-200">admin / admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
