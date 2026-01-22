/**
 * SuperApp Layout - Warmth & Approachability UI
 *
 * This layout wraps all user-facing routes with the warm, friendly design:
 * - Layered shadows
 * - Generous spacing
 * - Touch-optimized targets (≥44px)
 * - Responsive: Mobile-first with Desktop adaptations
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
import { OfflineIndicator } from "@/components/pwa";
import { PrivacyToggle } from "@/components/privacy-toggle";
import { Logo } from "@/components/ui/logo";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:bg-slate-100 dark:lg:bg-slate-900 flex flex-col">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Desktop Header - Hidden on mobile */}
      <header className="hidden lg:flex fixed top-0 inset-x-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-white/10 shadow-sm">
        <div className="w-full max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-primary/10 transition-colors"
                >
                  <item.icon className="w-5 h-5" weight="duotone" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Privacy Toggle */}
            <PrivacyToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 lg:pb-8 lg:pt-20">
        <div className="lg:max-w-5xl lg:mx-auto lg:px-6">
          {/* Desktop card wrapper */}
          <div className="lg:bg-white dark:lg:bg-slate-900 lg:rounded-2xl lg:shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] lg:min-h-[calc(100vh-144px)] lg:border lg:border-slate-200/50 dark:lg:border-white/10">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-white/10 shadow-[0_-1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between h-16 px-2 max-w-lg mx-auto">
          {/* Privacy Toggle - Mobile */}
          <div className="flex-shrink-0 pl-2">
            <PrivacyToggle />
          </div>
          
          {/* Nav Items */}
          <div className="flex items-center justify-around flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center min-h-11 min-w-11 px-3 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-primary/10 transition-colors"
              >
                <item.icon className="w-6 h-6" weight="duotone" />
                <span className="text-[10px] font-medium mt-0.5">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
