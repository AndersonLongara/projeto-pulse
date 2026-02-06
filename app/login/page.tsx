/**
 * Login Page
 *
 * Authentication page with role-based redirects.
 * - ADMIN/SUPER_ADMIN → /dashboard
 * - USER → /chat
 *
 * @see .github/agents/Master.agent.md - Section 2.1 (4px Grid)
 */

"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(login, initialState);

  // Redirect on successful login
  useEffect(() => {
    if (state.success) {
      // Small delay to allow cookie to be set
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
      <Card className="w-full max-w-sm shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] dark:bg-slate-900 dark:border-white/10">
        <CardHeader className="space-y-3 text-center pb-6">
          {/* Logo */}
          <div className="mx-auto">
            <Logo alt="Pulse IA" className="h-12 w-auto object-contain mx-auto" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Pulse IA
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* Error Message */}
            {state.error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {state.error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium dark:text-slate-200">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu.email@empresa.com"
                autoComplete="email"
                required
                disabled={isPending}
                className="h-11"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium dark:text-slate-200">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={isPending}
                className="h-11"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 font-medium"
            >
              {isPending ? (
                <>
                  <Spinner className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Credenciais de demonstração:
            </p>
            <div className="space-y-2 text-xs font-mono bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admin:</span>
                <span>admin@pulse.com / demo123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span>nome.matricula@pulse.com / demo123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
