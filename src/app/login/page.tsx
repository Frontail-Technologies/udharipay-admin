"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, WalletCards } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLogin } from "@/api/generated/auth";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { authKeys, useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/entity/FormField";

type LoginValues = { identifier: string; password: string };

const activityNodes = [
  { left: "7%", top: "22%", height: "23%", active: false },
  { left: "18%", top: "14%", height: "31%", active: true },
  { left: "29%", top: "36%", height: "25%", active: false },
  { left: "43%", top: "27%", height: "27%", active: true },
  { left: "58%", top: "17%", height: "34%", active: true },
  { left: "73%", top: "31%", height: "29%", active: false },
  { left: "87%", top: "20%", height: "28%", active: false },
  { left: "12%", top: "56%", height: "27%", active: true },
  { left: "31%", top: "62%", height: "24%", active: false },
  { left: "51%", top: "57%", height: "30%", active: false },
  { left: "70%", top: "55%", height: "31%", active: true },
  { left: "89%", top: "60%", height: "25%", active: false }
] as const;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-background"><Loader2 className="size-5 animate-spin text-primary" aria-label="Loading login" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const login = useMutation({ mutationFn: (values: LoginValues) => adminLogin(values) });
  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginValues>();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace(safeNext(searchParams.get("next")));
  }, [isAuthenticated, router, searchParams]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      await queryClient.invalidateQueries({ queryKey: authKeys.session });
      router.replace(safeNext(searchParams.get("next")));
    } catch (error) {
      const result = applyApiFormErrors(error, setError);
      if (!result.applied) setError("root", { message: result.error.message });
    }
  });

  return (
    <main className="grid min-h-dvh w-full overflow-y-auto bg-background lg:grid-cols-[minmax(0,1.15fr)_minmax(440px,0.85fr)]">
      <BrandPanel />

      <div className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[0_24px_70px_color-mix(in_oklch,var(--foreground),transparent_90%)] sm:p-8" aria-labelledby="login-title">
          <BrandMark compact />

          <div className="mb-7 mt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">Admin workspace</p>
            <h1 id="login-title" className="mt-2 text-2xl font-semibold text-text-primary">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Sign in to manage UdhariPay operations and platform activity.</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
            <FormField label="Email or phone" htmlFor="identifier" error={errors.identifier?.message}>
              <Input
                id="identifier"
                autoComplete="username"
                autoFocus
                aria-invalid={Boolean(errors.identifier)}
                className="h-11 px-3.5"
                placeholder="Enter your email or phone"
                {...register("identifier", { required: "Email or phone is required" })}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 px-3.5 pr-11"
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center rounded-r-lg text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </div>
            </FormField>

            {errors.root?.message && <p role="alert" className="rounded-lg border border-error/25 bg-error/5 px-3 py-2.5 text-sm text-error">{errors.root.message}</p>}

            <Button type="submit" size="lg" disabled={login.isPending} className="mt-1 h-11 w-full cursor-pointer text-sm">
              {login.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-text-muted">
            <ShieldCheck className="size-4 text-success" aria-hidden="true" />
            Protected administrative access
          </div>
        </section>
      </div>
    </main>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden min-h-dvh overflow-hidden border-r border-white/8 bg-[var(--login-visual)] p-10 text-white lg:flex lg:flex-col xl:p-14" aria-label="UdhariPay platform overview">
      <div className="relative z-10">
        <BrandMark />
      </div>

      <div className="relative z-10 mt-auto max-w-xl pb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--login-accent)]">Financial operations, connected</p>
        <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.15] text-white xl:text-5xl">One workspace for every UdhariPay operation.</h2>
        <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/58">Monitor merchants, customers, collections, KYC, mandates and payments from a secure administrative console.</p>
      </div>

      <div className="absolute inset-x-7 top-[16%] h-[58%]" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--login-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--login-grid)_1px,transparent_1px)] bg-[size:84px_84px] opacity-50" />
        <div className="absolute left-[8%] top-[2%] h-[52%] w-px origin-top -rotate-[14deg] bg-white/20" />
        <div className="absolute right-[18%] top-0 h-[48%] w-px origin-top rotate-[14deg] bg-white/20" />
        {activityNodes.map((node, index) => (
          <div key={index} className="absolute w-px bg-white/14" style={{ left: node.left, top: node.top, height: node.height }}>
            <span className={`absolute -left-1.5 -top-1.5 size-3 rounded-full border ${node.active ? "border-[var(--login-accent)] bg-[var(--login-accent)] shadow-[0_0_18px_var(--login-accent)]" : "border-white/20 bg-white/12"}`} />
            <span className={`absolute -left-2.5 -top-2 h-px w-2 origin-right rotate-[-32deg] ${node.active ? "bg-[var(--login-accent)]" : "bg-white/18"}`} />
            <span className={`absolute left-0.5 -top-2 h-px w-2 origin-left rotate-[32deg] ${node.active ? "bg-[var(--login-accent)]" : "bg-white/18"}`} />
          </div>
        ))}
      </div>
    </aside>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${compact ? "size-10" : "size-11"} grid shrink-0 place-items-center rounded-xl bg-primary text-white shadow-[0_10px_28px_color-mix(in_oklch,var(--primary),transparent_62%)]`}>
        <WalletCards className={compact ? "size-5" : "size-6"} aria-hidden="true" />
      </span>
      <span className={`${compact ? "text-lg text-text-primary" : "text-xl text-white"} font-semibold`}>UdhariPay <span className="text-primary">Admin</span></span>
    </div>
  );
}

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}
