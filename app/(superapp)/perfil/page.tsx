"use client";

/**
 * Profile Page - User Settings & Notifications
 *
 * Allows users to:
 * - View their profile information
 * - Enable/disable push notifications
 * - Change theme (light/dark/system)
 * - Logout
 *
 * @see Phase 4 - Push Notifications setup
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  User,
  Envelope,
  IdentificationCard,
  Buildings,
  Bell,
  SignOut,
  Gear,
  Sun,
  Moon,
  Monitor,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationPermissionButton } from "@/components/pwa";
import { logout } from "@/lib/actions/auth";

interface UserProfile {
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  departamento: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // In a real app, this would fetch from the server
    // For now, we'll use placeholder data
    const loadProfile = async () => {
      try {
        // Simulated profile data
        setProfile({
          nome: "Maria Silva Santos",
          email: "maria@pulse.com",
          matricula: "12345",
          cargo: "Analista de Sistemas",
          departamento: "Tecnologia",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground dark:text-slate-50">
          Perfil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
          Gerencie suas informações e preferências
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground dark:text-slate-50">{profile?.nome}</CardTitle>
              <p className="text-sm text-muted-foreground dark:text-slate-400">{profile?.cargo}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-foreground dark:text-slate-300">
            <Envelope className="w-5 h-5 text-muted-foreground dark:text-slate-400" />
            <span>{profile?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground dark:text-slate-300">
            <IdentificationCard className="w-5 h-5 text-muted-foreground dark:text-slate-400" />
            <span className="font-mono tabular-nums">
              Matrícula: {profile?.matricula}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground dark:text-slate-300">
            <Buildings className="w-5 h-5 text-muted-foreground dark:text-slate-400" />
            <span>{profile?.departamento}</span>
          </div>
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-foreground dark:text-slate-50">
            <Gear className="w-5 h-5" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-muted-foreground dark:text-slate-400" />
              <span className="text-sm font-medium text-foreground dark:text-slate-50">Tema</span>
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mb-3">
              Escolha entre tema claro, escuro ou automático
            </p>
            {mounted && (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full dark:bg-slate-800/50 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" weight="duotone" />
                      <span>Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" weight="duotone" />
                      <span>Escuro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" weight="duotone" />
                      <span>Sistema</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <Separator className="dark:bg-white/10" />

          {/* Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-muted-foreground dark:text-slate-400" />
              <span className="text-sm font-medium text-foreground dark:text-slate-50">Notificações Push</span>
            </div>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mb-3">
              Receba alertas quando um atendente humano assumir sua conversa.
            </p>
            <NotificationPermissionButton className="w-full" />
          </div>

          <Separator className="dark:bg-white/10" />

          {/* App Info */}
          <div className="text-xs text-muted-foreground dark:text-slate-400">
            <p>Pulse IA v1.0.0</p>
            <p className="mt-1">
              Versão PWA • Funciona offline
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full min-h-11 gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
        onClick={handleLogout}
      >
        <SignOut className="w-5 h-5" />
        Sair da conta
      </Button>
    </div>
  );
}
