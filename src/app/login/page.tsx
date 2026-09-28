import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { LoginForm } from "./login-form";
import { MidnightSkyBackground } from "@/components/auth/midnight-sky-background";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your StreamVault account to access your personalized streaming experience.",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col justify-start sm:justify-center items-center pt-20 sm:pt-28 pb-12 sm:pb-16 px-3 sm:px-6 overflow-x-hidden">
      {/* Animated Midnight Sky Background with Twinkling Stars, Meteors & Moon (uiverse.io/kiranmayee-abbireddy/average-insect-70) */}
      <MidnightSkyBackground />

      <Container size="sm" className="relative z-10 w-full max-w-md flex flex-col items-center my-auto">
        <Suspense
          fallback={
            <div className="w-full max-w-[400px] h-[480px] rounded-[28px] border border-white/10 bg-zinc-900/60 p-8 animate-pulse space-y-4" />
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
