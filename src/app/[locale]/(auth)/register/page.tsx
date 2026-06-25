"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { RegisterSchema, type RegisterInput } from "@/schemas/auth.schema";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const GO_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const PERKS = [
  "No credit card required",
  "End-to-end encrypted meetings",
  "Cancel anytime",
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      await registerUser(data);
    } catch (e: any) {
      setServerError(e?.message ?? "Registration failed. Try again.");
    }
  };

  const handleGithubAuth = () => {
    window.location.href = `${GO_API_URL}/api/v1/auth/github`;
  };

  return (
    <div className="w-full max-w-[440px] animate-fade-up">
      <div
        className="rounded-[20px] p-8 flex flex-col gap-6"
        style={{
          background: "#F3F8EF",
          border: "1px solid #D5E3CC",
          boxShadow: "0px 16px 48px rgba(0,0,0,0.07), 0px 1px 0px rgba(255,255,255,0.7) inset",
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "#2C3E2D" }}
          >
            Create your account
          </h1>
          <p className="text-sm" style={{ color: "#8D7A7A" }}>
            Join Recallo and start connecting instantly
          </p>
        </div>

        {/* Perks */}
        <div className="flex flex-col gap-1.5">
          {PERKS.map(perk => (
            <div key={perk} className="flex items-center gap-2">
              <CheckCircle2 size={13} style={{ color: "#9CC5A1" }} />
              <span className="text-xs" style={{ color: "#8D7A7A" }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* Error banner */}
        {serverError && (
          <div
            className="flex items-start gap-2.5 rounded-[10px] p-3 text-sm animate-fade-in"
            style={{
              background: "rgba(186,90,90,0.08)",
              color: "#BA5A5A",
              border: "1px solid rgba(186,90,90,0.2)",
            }}
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {serverError}
          </div>
        )}

        {/* GitHub OAuth */}
        <button
          type="button"
          id="btn-github-register"
          onClick={handleGithubAuth}
          className="flex items-center justify-center gap-2.5 w-full h-10 rounded-[10px] text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
          style={{ background: "#18181b", color: "#fff" }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
          </svg>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "#D5E3CC" }} />
          <span className="text-xs font-medium" style={{ color: "#8D7A7A" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "#D5E3CC" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-name"
              className="text-xs font-medium"
              style={{ color: "#2C3E2D" }}
            >
              Full name
            </label>
            <Input
              id="register-name"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs" style={{ color: "#BA5A5A" }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-email"
              className="text-xs font-medium"
              style={{ color: "#2C3E2D" }}
            >
              Email address
            </label>
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs" style={{ color: "#BA5A5A" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-password"
              className="text-xs font-medium"
              style={{ color: "#2C3E2D" }}
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: "#8D7A7A" }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs" style={{ color: "#BA5A5A" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-confirm-password"
              className="text-xs font-medium"
              style={{ color: "#2C3E2D" }}
            >
              Confirm password
            </label>
            <div className="relative">
              <Input
                id="register-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: "#8D7A7A" }}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs" style={{ color: "#BA5A5A" }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="btn-register-submit"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-[10px] text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            style={{ background: "linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)" }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : null}
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* ToS */}
        <p className="text-center text-[11px]" style={{ color: "#8D7A7A" }}>
          By creating an account, you agree to our{" "}
          <Link href="#" className="hover:underline" style={{ color: "#BA5A5A" }}>Terms</Link>
          {" "}and{" "}
          <Link href="#" className="hover:underline" style={{ color: "#BA5A5A" }}>Privacy Policy</Link>.
        </p>

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: "#8D7A7A" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "#BA5A5A" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
