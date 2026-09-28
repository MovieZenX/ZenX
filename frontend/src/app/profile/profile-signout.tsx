"use client";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

export function ProfileSignOutButton() {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => logout()}
      isLoading={isLoading}
      className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-200"
    >
      <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Sign Out
    </Button>
  );
}
