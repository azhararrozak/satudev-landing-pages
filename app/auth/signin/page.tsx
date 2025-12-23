"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/organisms/FormInput";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import Link from "next/link";
import { authClient as client } from "@/lib/auth-client";

const SignInSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof SignInSchema>;

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
  });
  const router = useRouter();
  const { setUser, setSession } = useAuthStore();

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);

    try {
      await client.signIn.email({
        ...data,
        fetchOptions: {
          onResponse: () => {
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            // Get session immediately
            const session = await client.getSession();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sessionData = session as any;
            
            // Update Zustand store immediately
            if (sessionData?.data?.user && sessionData?.data?.session) {
              setUser({
                id: sessionData.data.user.id,
                name: sessionData.data.user.name,
                email: sessionData.data.user.email,
                emailVerified: sessionData.data.user.emailVerified,
                image: sessionData.data.user.image || undefined,
                role: sessionData.data.user.role || 'user',
                createdAt: new Date(sessionData.data.user.createdAt),
                updatedAt: new Date(sessionData.data.user.updatedAt),
              });
              
              setSession({
                id: sessionData.data.session.id,
                expiresAt: new Date(sessionData.data.session.expiresAt),
                token: sessionData.data.session.token,
                userId: sessionData.data.session.userId,
              });
            }
            
            const userRole = sessionData?.data?.user?.role || 'user';
            
            toast.success("Successfully signed in!");
            
            // Small delay to ensure state update propagates
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Trigger auth sync event for other components
            window.dispatchEvent(new Event('auth-change'));
            
            // Redirect based on role
            if (userRole === 'admin' || userRole === 'penulis') {
              router.push("/dashboard");
            } else {
              router.push("/");
            }
          },
        },
      });
    } catch (error) {
      console.error("An error occurred during sign-in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register}
            errors={errors}
          />

          <Button
            type="submit"
            variant="default"
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
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
    </div>
  );
};

export default SignInPage;