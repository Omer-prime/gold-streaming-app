"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar automatically when route changes (on mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarBase =
    "fixed md:static inset-y-0 left-0 z-40 w-72 border-r border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col shadow-xl shadow-black/40 transform transition-transform duration-200";
  const sidebarState = mobileOpen
    ? "translate-x-0"
    : "-translate-x-full md:translate-x-0";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-900 px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/40">
            <span className="text-[13px] font-extrabold text-black">GL</span>
          </div>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold tracking-tight">
              Gold Live Admin
            </p>
            <p className="text-[11px] text-slate-400">Platform control center</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-slate-100"
        >
          <span className="sr-only">Toggle navigation</span>
          {/* simple hamburger / close based on state */}
          {mobileOpen ? (
            <span className="text-xl leading-none">&times;</span>
          ) : (
            <span className="text-xl leading-none">&#9776;</span>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarBase} ${sidebarState}`}>
        {/* brand (desktop) */}
        <div className="hidden md:flex px-5 py-5 border-b border-slate-900 items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/40">
            <span className="text-[14px] font-extrabold text-black">GL</span>
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">
              Gold Live Admin
            </p>
            <p className="text-[11px] text-slate-400">
              Platform control center
            </p>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 text-sm overflow-y-auto">
          <SectionLabel>Platform</SectionLabel>
          <NavLink
            href="/admin"
            label="Dashboard"
            icon="📊"
            pathname={pathname}
            exact
            onClick={() => setMobileOpen(false)}
          />
          <NavLink
            href="/admin/users"
            label="Users"
            icon="👥"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
          <NavLink
            href="/admin/hosts"
            label="Hosts"
            icon="🎤"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
          <NavLink
            href="/admin/streams"
            label="Streams"
            icon="📺"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
          <NavLink
            href="/admin/gifts"
            label="Gifts"
            icon="🎁"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />

          {/* ✅ Rewards */}
          <NavLink
            href="/admin/rewards"
            label="Rewards"
            icon="🏆"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
           <NavLink
            href="/admin/vip"
            label="VIP Plans"
            icon="👑"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
        
          <NavLink
            href="/admin/guardian"
            label="Guardian Plans"
            icon="🛡️"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />

        
          <NavLink
            href="/admin/store"
            label="Store"
            icon="🛍️"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />

          <NavLink
            href="/admin/notifications"
            label="Notifications"
            icon="🔔"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
          <NavLink
            href="/admin/countries"
            label="Countries"
            icon="🌍"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
          <NavLink
            href="/admin/live-applications"
            label="Live applications"
            icon="🪪"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />

          <NavLink
            href="/admin/topics"
            label="Topics"
            icon="🏷️"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />

          <div className="mt-4 pt-4 border-t border-slate-900/80">
            <SectionLabel>Operations</SectionLabel>
            <NavLink
              href="/admin/agencies"
              label="Agencies"
              icon="🏢"
              pathname={pathname}
              onClick={() => setMobileOpen(false)}
            />
            <NavLink
              href="/admin/moderation"
              label="Moderation"
              icon="🛡️"
              pathname={pathname}
              onClick={() => setMobileOpen(false)}
            />
          </div>

          <NavLink
            href="/admin/currency-trading"
            label="Currency trading"
            icon="💱"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />

          <NavLink
            href="/admin/base-salary-approval"
            label="Base salary approval"
            icon="💵"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />

          <NavLink
            href="/admin/reseller-approval"
            label="Reseller approval"
            icon="✅"
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
        </nav>

        {/* footer */}
        <div className="px-5 py-4 border-t border-slate-900/80 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-semibold">
              GL
            </span>
            <span>Logged in as</span>
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs text-slate-100 border border-slate-700">
            ADMIN
          </span>
        </div>
      </aside>

      {/* Mobile dark overlay behind sidebar */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* main content */}
      <main className="flex-1 p-4 md:p-6 bg-slate-950">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  pathname,
  exact = false,
  onClick,
}: {
  href: string;
  label: string;
  icon?: string;
  pathname: string | null;
  exact?: boolean;
  onClick?: () => void;
}) {
  const isActive = pathname
    ? exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/")
    : false;

  const baseClasses =
    "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors";
  const stateClasses = isActive
    ? "bg-slate-900 text-slate-50 border border-slate-700 shadow-sm shadow-slate-900"
    : "text-slate-300 hover:bg-slate-900/70 hover:text-slate-50 border border-transparent";

  return (
    <Link href={href} className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      <span
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full text-[15px] bg-slate-900/80 border border-slate-800",
          isActive
            ? "shadow-inner shadow-yellow-400/40"
            : "group-hover:border-slate-700",
        ].join(" ")}
      >
        {icon ?? "•"}
      </span>
      <span className="text-[14px] font-medium tracking-tight">{label}</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
      {children}
    </div>
  );
}
