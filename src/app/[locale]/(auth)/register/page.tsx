"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { RegisterSchema, type RegisterInput } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const GO_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
    } catch {
      // Error toast handled inside useAuth
    }
  };

  const handleGithubAuth = () => {
    window.location.href = `${GO_API_URL}/api/v1/auth/github`;
  };

  return (
    <div className="recallo-auth-page">
      <div className="recallo-auth-card">
        {/* Logo / Brand */}
        <div className="recallo-auth-brand">
          <div className="recallo-auth-logo">
            <span>R</span>
          </div>
          <h1 className="recallo-auth-title">Create your account</h1>
          <p className="recallo-auth-subtitle">
            Start remembering everything with Recallo
          </p>
        </div>

        {/* GitHub OAuth */}
        <button
          type="button"
          id="btn-github-register"
          className="recallo-oauth-btn"
          onClick={handleGithubAuth}
        >
          <svg
            className="recallo-oauth-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
          </svg>
          Continue with GitHub
        </button>

        <div className="recallo-divider">
          <span>or</span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="recallo-auth-form">
          <div className="recallo-field">
            <label htmlFor="register-name" className="recallo-label">
              Full name
            </label>
            <Input
              id="register-name"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              className="recallo-input"
              {...register("name")}
            />
            {errors.name && (
              <p className="recallo-field-error">{errors.name.message}</p>
            )}
          </div>

          <div className="recallo-field">
            <label htmlFor="register-email" className="recallo-label">
              Email
            </label>
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="recallo-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="recallo-field-error">{errors.email.message}</p>
            )}
          </div>

          <div className="recallo-field">
            <label htmlFor="register-password" className="recallo-label">
              Password
            </label>
            <div className="recallo-input-wrapper">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="recallo-input"
                {...register("password")}
              />
              <button
                type="button"
                className="recallo-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="recallo-field-error">{errors.password.message}</p>
            )}
          </div>

          <div className="recallo-field">
            <label
              htmlFor="register-confirm-password"
              className="recallo-label"
            >
              Confirm password
            </label>
            <div className="recallo-input-wrapper">
              <Input
                id="register-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className="recallo-input"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="recallo-eye-btn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="recallo-field-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            id="btn-register-submit"
            type="submit"
            disabled={isSubmitting}
            className="recallo-submit-btn"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : null}
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="recallo-auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="recallo-auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
