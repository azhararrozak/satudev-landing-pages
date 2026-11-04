"use client";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/organisms/FormInput";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, normalizeRole } from "@/lib/stores/auth-store";
import type { UserRole } from "@/schema/auth-schema";
import { toast } from "sonner";
import Link from "next/link";
import { authClient as client } from "@/lib/auth-client";

const SignInSchema = z.object({
  email: z.string().trim().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof SignInSchema>;

interface EnrichedSignInPayload {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    role?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: string | Date;
    token: string;
  };
}

function resolvePostLoginTarget(role: UserRole, rawCallbackUrl: string | null): string {
  const isSafeInternal =
    rawCallbackUrl &&
    rawCallbackUrl.startsWith("/") &&
    !rawCallbackUrl.startsWith("//") &&
    !rawCallbackUrl.startsWith("/auth");

  if (role === "admin" || role === "penulis") {
    return isSafeInternal ? rawCallbackUrl : "/dashboard";
  }

  if (isSafeInternal && !rawCallbackUrl.startsWith("/dashboard")) {
    return rawCallbackUrl;
  }

  return "/";
}

const SignInFormCard = () => {
  const [status, setStatus] = useState<"idle" | "signing-in" | "redirecting">("idle");
  const isBusy = status !== "idle";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    mode: "onTouched",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Pre-warm Neon serverless compute while the user enters credentials
  useEffect(() => {
    void fetch("/api/auth/warmup", { cache: "no-store" }).catch(() => {});
  }, []);

  const onSubmit = async (data: SignInForm) => {
    setStatus("signing-in");

    try {
      const { data: signInData, error } = await client.signIn.email({
        email: data.email.trim(),
        password: data.password,
      });

      if (error || !signInData) {
        toast.error(error?.message || "Invalid email or password");
        setStatus("idle");
        return;
      }

      const payload = signInData as unknown as EnrichedSignInPayload;
      let resolvedUser = payload.user;
      let resolvedSession = payload.session;

      // Fallback to /get-session only if user.role was not already embedded in sign-in response
      if (!resolvedUser?.role) {
        const sessionRes = await client.getSession({
          query: { disableCookieCache: true },
        });
        const fallbackData = (
          sessionRes as unknown as {
            data?: {
              user?: EnrichedSignInPayload["user"];
              session?: EnrichedSignInPayload["session"];
            } | null;
          }
        )?.data;

        if (fallbackData?.user) {
          resolvedUser = fallbackData.user;
        }
        if (fallbackData?.session) {
          resolvedSession = fallbackData.session;
        }
      }

      const role = normalizeRole(resolvedUser?.role);

      if (resolvedUser) {
        const fallbackExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        setAuth(
          {
            id: resolvedUser.id,
            name: resolvedUser.name,
            email: resolvedUser.email,
            emailVerified: resolvedUser.emailVerified,
            image: resolvedUser.image || undefined,
            role,
            createdAt: new Date(resolvedUser.createdAt),
            updatedAt: new Date(resolvedUser.updatedAt),
          },
          {
            id: resolvedSession?.id || resolvedUser.id,
            expiresAt: resolvedSession?.expiresAt
              ? new Date(resolvedSession.expiresAt)
              : fallbackExpiry,
            token: resolvedSession?.token || payload.token || "",
            userId: resolvedSession?.userId || resolvedUser.id,
          }
        );
      }

      setStatus("redirecting");
      toast.success("Successfully signed in!");

      const targetUrl = resolvePostLoginTarget(role, searchParams.get("callbackUrl"));
      router.replace(targetUrl);

      // Failsafe: ensure navigation completes even if Next.js router cache holds a stale entry
      window.setTimeout(() => {
        if (window.location.pathname.startsWith("/auth")) {
          window.location.replace(targetUrl);
        }
      }, 800);
    } catch (error) {
      console.error("An error occurred during sign-in:", error);
      toast.error("An unexpected error occurred during sign-in");
      setStatus("idle");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full p-8 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl bg-white dark:bg-slate-800/50 backdrop-blur">
      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-slate-600 dark:text-slate-400">Sign in to your account</p>
      </div>
      <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          spellCheck={false}
          enterKeyHint="next"
          required
          disabled={isBusy}
          register={register}
          errors={errors}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          enterKeyHint="done"
          required
          disabled={isBusy}
          register={register}
          errors={errors}
        />

        <Button
          type="submit"
          variant="default"
          className="w-full min-h-12 mt-4 text-base"
          disabled={isBusy}
        >
          {status === "signing-in"
            ? "Signing In..."
            : status === "redirecting"
              ? "Redirecting..."
              : "Sign In"}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Need to create an account?{" "}
          <Link href="/auth/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Suspense
        fallback={
          <div className="max-w-md mx-auto w-full p-8 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl bg-white dark:bg-slate-800/50 backdrop-blur animate-pulse h-[440px]" />
        }
      >
        <SignInFormCard />
      </Suspense>
    </div>
  );
};

export default SignInPage;