/**
 * Admin Layout - Precision & Density UI
 *
 * This layout wraps all admin routes with the precision-focused design:
 * - Subtle borders (0.5px)
 * - High information density
 * - font-mono for data display
 *
 * @see .github/agents/Master.agent.md - Section 2.3
 */

import Link from "next/link";
import {
  House,
  ChatCircleDots,
  Users,
  Gear,
  SignOut,
  ChartLine,
} from "@phosphor-icons/react/dist/ssr";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", icon: House, label: "Dashboard" },
  { href: "/analytics", icon: ChartLine, label: "Analytics" },
  { href: "/chats", icon: ChatCircleDots, label: "Conversas" },
  { href: "/users", icon: Users, label: "Usuários" },
  { href: "/settings", icon: Gear, label: "Configurações" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-white/10">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200/50 dark:border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">P</span>
            </div>
            <span className="font-semibold tracking-tight dark:text-slate-50">Pulse Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <item.icon className="w-5 h-5" weight="duotone" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {session?.nome
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "AD"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-slate-200">{session?.nome}</p>
              <p className="text-xs text-muted-foreground dark:text-slate-400 truncate">
                {session?.role === "SUPER_ADMIN" ? "Super Admin" : "Administrador"}
              </p>
            </div>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-slate-200"
            >
              <SignOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-20 h-14 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
          <span className="font-semibold tracking-tight dark:text-slate-50">Pulse</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/chats">
            <Button variant="ghost" size="icon">
              <ChatCircleDots className="w-5 h-5" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
