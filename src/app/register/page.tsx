import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { RegisterForm } from "./register-form";
import { MidnightSkyBackground } from "@/components/auth/midnight-sky-background";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your StreamVault account to discover, watch, and personalize your streaming library.",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-[calc(100dvh-4rem)] flex flex-col justify-center items-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Animated Midnight Sky Background with Twinkling Stars, Meteors & Moon (uiverse.io/kiranmayee-abbireddy/average-insect-70) */}
      <MidnightSkyBackground />

      <Container size="sm" className="relative z-10 w-full max-w-md flex flex-col items-center my-auto">
        <Suspense
          fallback={
            <div className="w-full max-w-[420px] h-[580px] rounded-[28px] border border-white/10 bg-zinc-900/60 p-8 animate-pulse space-y-4" />
          }
        >
          <RegisterForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-gray-500">
          By registering, you agree to StreamVault&apos;s Terms of Service and Privacy Policy.
        </p>
      </Container>
    </main>
  );
}
