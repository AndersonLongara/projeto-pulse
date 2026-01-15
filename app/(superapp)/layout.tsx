/**
 * SuperApp Layout - Warmth & Approachability UI
 *
 * This layout wraps all user-facing routes with the warm, friendly design:
 * - Layered shadows
 * - Generous spacing
 * - Touch-optimized targets (≥44px)
 *
 * @see .github/agents/Master.agent.md - Section 2.3
 */

import Link from "next/link";
import {
  House,
  ChatCircleDots,
  CalendarCheck,
  User,
} from "@phosphor-icons/react/dist/ssr";

const navItems = [
  { href: "/", icon: House, label: "Início" },
  { href: "/chat", icon: ChatCircleDots, label: "Chat" },
  { href: "/ferias", icon: CalendarCheck, label: "Férias" },
  { href: "/perfil", icon: User, label: "Perfil" },
];

export default function SuperAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200/50 shadow-[0_-1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-16 px-4 max-w-lg mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center min-h-11 min-w-11 px-3 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <item.icon className="w-6 h-6" weight="duotone" />
              <span className="text-[10px] font-medium mt-0.5">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
