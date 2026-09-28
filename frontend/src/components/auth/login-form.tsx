"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { ROUTES } from "@/config";
import styles from "./fluffy-treefrog-form.module.css";

function getSafeRedirectUrl(target: string | null): string {
  if (!target) return ROUTES.PROFILE;
  // Prevent open redirect vulnerabilities: only allow local relative paths
  if (target.startsWith("/") && !target.startsWith("//") && !target.includes("://")) {
    return target;
  }
  return ROUTES.PROFILE;
}

/**
 * Login Form component using uiverse.io/Priyanshu02020/fluffy-treefrog-31
 * Features spinning conic-gradient border glow, 3D inset shadows, and frosted glass.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = getSafeRedirectUrl(searchParams.get("redirect"));
  const { refreshUser } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError("Please enter your email or username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmedIdentifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      // Refresh auth state in client context
      await refreshUser();
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.loginBox}>
        {/* Brand Embossed Logo Icon */}
        <div className={styles.logoWrapper}>
          <Link href={ROUTES.HOME} className={styles.logo} title="StreamVault Home">
            <svg
              className="h-7 w-7 text-white fill-current ml-0.5 filter drop-shadow-md"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </Link>
        </div>

        <span className={styles.header}>Welcome Back!</span>
        <span className={styles.subHeader}>
          Sign in to your StreamVault account
        </span>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 animate-in fade-in duration-200"
            >
              <svg
                className="h-4 w-4 shrink-0 text-red-400 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Identifier Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="identifier" className={styles.inputLabel}>
              Email or Username
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={true}
                placeholder="you@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                required
                className={`${styles.input} ${styles.inputWithIcon}`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={true}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className={`${styles.input} ${styles.inputWithIcon} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggleBtn}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Links with animated hover underline */}
        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link
            href={`${ROUTES.REGISTER}${redirectUrl !== ROUTES.PROFILE ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className={styles.link}
          >
            Sign up, it&apos;s free!
          </Link>
        </p>
      </div>
    </div>
  );
}
