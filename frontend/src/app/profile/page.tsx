import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/backend/auth";
import { prisma } from "@/backend/db";
import { ROUTES } from "@/config";
import { ProfileSignOutButton } from "./profile-signout";

export const metadata: Metadata = {
  title: "Profile & Preferences",
  description: "Manage your streaming profile, playback settings, and account details.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Container className="pt-28 pb-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-white">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sign in to view your profile
            </h1>
            <p className="text-sm text-gray-400">
              You must be logged in with a StreamVault account to view your profile and manage playback preferences.
            </p>
          </div>

          <Card className="p-6 bg-surface-card border-white/10 space-y-3">
            <Link
              href={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.PROFILE)}`}
              className="flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={`${ROUTES.REGISTER}?redirect=${encodeURIComponent(ROUTES.PROFILE)}`}
              className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Create an Account
            </Link>
          </Card>
        </div>
      </Container>
    );
  }

  // Authenticated user: load preferences from SQLite via Prisma
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
  });

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Container className="pt-24 sm:pt-28 pb-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Profile & Settings
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage your account credentials and personalize your streaming playback defaults.
            </p>
          </div>
          <div>
            <ProfileSignOutButton />
          </div>
        </div>

        {/* Account Info Card */}
        <Card className="p-6 border-white/10 bg-surface-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-black shadow-md shadow-white/5">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{user.username}</h2>
                  <Badge variant="accent" size="sm">Active Account</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                <p className="text-[11px] text-gray-500 mt-1">Member since {memberSince}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Playback Preferences Card */}
        <Card className="p-6 space-y-4 border-white/10 bg-surface-card">
          <div>
            <h3 className="text-lg font-bold text-white">Playback Preferences</h3>
            <p className="text-xs text-gray-400">
              Stored in your account database preferences record.
            </p>
          </div>

          <div className="divide-y divide-white/[0.06] text-sm">
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-300">Preferred Quality</span>
              <span className="text-gray-400 font-mono text-xs uppercase">
                {preferences?.preferredQuality || "auto"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-300">Autoplay Next Episode</span>
              <span
                className={
                  preferences?.autoplay ?? true
                    ? "text-white font-medium"
                    : "text-gray-400 font-medium"
                }
              >
                {preferences?.autoplay ?? true ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-300">Subtitles by Default</span>
              <span
                className={
                  preferences?.subtitlesEnabled
                    ? "text-white font-medium"
                    : "text-gray-400 font-medium"
                }
              >
                {preferences?.subtitlesEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-300">Language</span>
              <span className="text-gray-400 font-mono text-xs uppercase">
                {preferences?.language || "en"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
