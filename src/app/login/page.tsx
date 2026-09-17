import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LoginForm } from "./login-form";
import { ROUTES } from "@/config";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your StreamVault account to access your personalized streaming experience.",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6">
      <Container size="sm" className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white mb-3 group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md shadow-white/5 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 text-black fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              StreamVault
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in with your email or username to continue
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/10 bg-surface-card p-6 sm:p-8 animate-pulse space-y-4">
              <div className="h-10 bg-white/5 rounded-xl" />
              <div className="h-10 bg-white/5 rounded-xl" />
              <div className="h-11 bg-white/20 rounded-xl" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to StreamVault&apos;s Terms of Service and Privacy Policy.
        </p>
      </Container>
    </main>
  );
}
