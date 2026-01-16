import { getSession } from "@/lib/auth";
import { getUserTheme } from "@/lib/actions/settings";
import { ThemeSelect } from "./theme-select";
import { redirect } from "next/navigation";
import { Gear, Palette, Bell, Shield, Database } from "@phosphor-icons/react/dist/ssr";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const theme = await getUserTheme();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white px-8 py-5 dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Configurações
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Personalize sua experiência na plataforma Pulse
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Aparência */}
          <section className="rounded-lg border border-slate-200/50 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Palette className="h-5 w-5 text-slate-700 dark:text-slate-300" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Aparência
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Personalize o tema visual da interface
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-50">
                    Tema
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Escolha entre tema claro, escuro ou automático baseado no sistema
                  </p>
                </div>
                <ThemeSelect initialTheme={theme ?? "system"} />
              </div>
            </div>
          </section>

          {/* Notificações */}
          <section className="rounded-lg border border-slate-200/50 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Notificações
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gerencie como e quando você quer ser notificado
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Em breve: Configurações de notificações
              </p>
            </div>
          </section>

          {/* Segurança */}
          <section className="rounded-lg border border-slate-200/50 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Shield className="h-5 w-5 text-slate-700 dark:text-slate-300" weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Segurança & Privacidade
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Proteja sua conta e seus dados
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Em breve: Configurações de segurança e privacidade
              </p>
            </div>
          </section>

          {/* Sistema */}
          {(session.role === "ADMIN" || session.role === "SUPER_ADMIN") && (
            <section className="rounded-lg border border-slate-200/50 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Database className="h-5 w-5 text-slate-700 dark:text-slate-300" weight="duotone" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Sistema
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Configurações avançadas da plataforma
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Em breve: Configurações de sistema
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
