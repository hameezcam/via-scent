"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Only allow redirects back into the admin console
  const nextParam = searchParams.get("next") || "/admin";
  const next = nextParam.startsWith("/admin") ? nextParam : "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>
      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-stone-900 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-amber-100 hover:bg-stone-800 disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-amber-200">
            <Lock className="w-4 h-4" />
          </span>
          <div>
            <h1 className="font-serif text-xl text-stone-900">Admin Console</h1>
            <p className="text-xs text-stone-500">VIA Scent staff only</p>
          </div>
        </div>
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
