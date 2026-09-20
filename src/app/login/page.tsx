"use client";

import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLogin } from "@/api/generated/auth";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { authKeys, useAuth } from "@/features/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/entity/FormField";

type LoginValues = { identifier: string; password: string };

export default function LoginPage() {
  return <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-background"><Loader2 className="size-5 animate-spin text-primary" aria-label="Loading login" /></div>}><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const login = useMutation({ mutationFn: (values: LoginValues) => adminLogin(values) });
  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginValues>();

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
    <main className="grid min-h-dvh place-items-center bg-background p-5">
      <section className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold text-primary">UdhariPay Admin</p>
          <h1 className="mt-1 text-xl font-semibold text-text-primary">Sign in</h1>
        </div>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FormField label="Email or phone" htmlFor="identifier" error={errors.identifier?.message}>
            <Input id="identifier" autoComplete="username" {...register("identifier", { required: "Email or phone is required" })} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" {...register("password", { required: "Password is required" })} />
          </FormField>
          {errors.root?.message && <p role="alert" className="text-sm text-error">{errors.root.message}</p>}
          <Button type="submit" disabled={login.isPending} className="mt-1 w-full">
            {login.isPending && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
}

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}
