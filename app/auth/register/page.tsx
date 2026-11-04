"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/organisms/FormInput";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore, normalizeRole } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import Link from "next/link";
import { authClient as client } from "@/lib/auth-client";

const RegisterSchema = z.object({
  email: z.string().trim().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().trim().min(1, "Name is required"),
});

type RegisterForm = z.infer<typeof RegisterSchema>;

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
  });
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Pre-warm Neon serverless compute while the user enters registration details
  useEffect(() => {
    void fetch("/api/auth/warmup", { cache: "no-store" }).catch(() => {});
  }, []);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      const { data: signUpData, error } = await client.signUp.email({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      if (error || !signUpData) {
        toast.error(error?.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      const payload = signUpData as unknown as {
        token?: string | null;
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
      };

      if (payload.user && (payload.token || payload.session)) {
        const role = normalizeRole(payload.user.role);
        setAuth(
          {
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
            emailVerified: payload.user.emailVerified,
            image: payload.user.image || undefined,
            role,
            createdAt: new Date(payload.user.createdAt),
            updatedAt: new Date(payload.user.updatedAt),
          },
          {
            id: payload.session?.id || payload.user.id,
            expiresAt: payload.session?.expiresAt
              ? new Date(payload.session.expiresAt)
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            token: payload.session?.token || payload.token || "",
            userId: payload.session?.userId || payload.user.id,
          }
        );

        toast.success("Account created successfully!");
        const target = role === "admin" || role === "penulis" ? "/dashboard" : "/";
        router.replace(target);
        return;
      }

      toast.success("Account created! Please sign in.");
      router.replace("/auth/signin");
    } catch (error) {
      console.error("An error occurred during registration:", error);
      toast.error("An unexpected error occurred during registration");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-auto p-8 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl bg-white dark:bg-slate-800/50 backdrop-blur">
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign up to get started</p>
        </div>
        <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInput
            label="Full Name"
            name="name"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            required
            disabled={isLoading}
            register={register}
            errors={errors}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            spellCheck={false}
            enterKeyHint="next"
            required
            disabled={isLoading}
            register={register}
            errors={errors}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            enterKeyHint="done"
            required
            disabled={isLoading}
            register={register}
            errors={errors}
          />

          <Button
            type="submit"
            variant="default"
            className="w-full min-h-12 mt-4 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;