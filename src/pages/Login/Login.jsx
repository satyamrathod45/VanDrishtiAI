import { useState } from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  PawPrint,
  ScanLine,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [officerId, setOfficerId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (
      !officerId.trim() ||
      !password.trim()
    ) {
      setError(
        "Please enter your Forest Officer ID and password."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await login(
          officerId.trim(),
          password
        );

      if (response.success) {
        navigate(
          "/overview",
          {
            replace: true,
          }
        );
      }
    } catch (error) {
      setError(
        error.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#e97813]/[0.035] blur-3xl" />

      <div className="pointer-events-none absolute -bottom-60 -right-40 h-[600px] w-[600px] rounded-full bg-[#171717]/[0.025] blur-3xl" />

      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(#171717 0.7px, transparent 0.7px)",
          backgroundSize:
            "22px 22px",
        }}
      />

      {/* Decorative tiger */}
      <div className="pointer-events-none absolute -bottom-20 -left-16 hidden text-[280px] opacity-[0.025] grayscale md:block">
        🐅
      </div>

      {/* Center */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">

        {/* Login card */}
        <section className="w-full max-w-[540px] rounded-[34px] border border-white/80 bg-white/90 px-6 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.07),0_8px_30px_rgba(0,0,0,0.035)] backdrop-blur-xl sm:px-12 sm:py-12">

          {/* Brand */}
          <div className="text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#171717] shadow-[0_10px_25px_rgba(0,0,0,0.12)]">

              <div className="relative">

                <ScanLine
                  size={30}
                  strokeWidth={1.8}
                  className="text-[#ef7d16]"
                />

                <PawPrint
                  size={14}
                  strokeWidth={2.5}
                  className="absolute left-[7px] top-[7px] text-white"
                />

              </div>

            </div>

            <h1 className="text-[34px] font-bold tracking-[-1.7px] text-[#202020] sm:text-[37px]">
              Van
              <span className="text-[#e97813]">
                Drishti
              </span>
            </h1>

            <p className="mt-2 text-[13px] text-[#8a8a8a]">
              Tiger Monitoring Intelligence System
            </p>

          </div>

          {/* Welcome */}
          <div className="mb-8 mt-10 text-center">

            <h2 className="text-[27px] font-semibold tracking-[-0.8px] text-[#222]">
              Welcome Back
            </h2>

            <p className="mt-2 text-[14px] text-[#858585]">
              Sign in to access VanDrishti
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Forest Officer ID */}
            <div>

              <label
                htmlFor="officerId"
                className="mb-2 block text-[13px] font-semibold text-[#2c2c2c]"
              >
                Forest Officer ID
              </label>

              <div className="group flex h-[54px] items-center gap-3 rounded-[14px] border border-[#e2e2e2] bg-white px-4 transition-all duration-200 focus-within:border-[#e97813] focus-within:ring-4 focus-within:ring-[#e97813]/[0.08]">

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f7f7f5] text-[11px] font-bold text-[#777] transition-colors group-focus-within:bg-[#e97813]/10 group-focus-within:text-[#e97813]">
                  FO
                </div>

                <input
                  id="officerId"
                  type="text"
                  value={officerId}
                  onChange={(event) =>
                    setOfficerId(
                      event.target.value
                    )
                  }
                  placeholder="Enter your officer ID"
                  autoComplete="username"
                  className="h-full w-full bg-transparent text-[14px] text-[#222] outline-none placeholder:text-[#a4a4a4]"
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-[13px] font-semibold text-[#2c2c2c]"
              >
                Password
              </label>

              <div className="group flex h-[54px] items-center gap-3 rounded-[14px] border border-[#e2e2e2] bg-white px-4 transition-all duration-200 focus-within:border-[#e97813] focus-within:ring-4 focus-within:ring-[#e97813]/[0.08]">

                <LockKeyhole
                  size={18}
                  className="shrink-0 text-[#969696] transition-colors group-focus-within:text-[#e97813]"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-full w-full bg-transparent text-[14px] text-[#222] outline-none placeholder:text-[#a4a4a4]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value
                    )
                  }
                  className="flex shrink-0 items-center justify-center rounded-lg p-1 text-[#909090] transition hover:text-[#e97813]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {error}
              </div>
            )}

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex h-[55px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-[14px] bg-[#ed7910] text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(237,123,18,0.20)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#e8740b] hover:shadow-[0_14px_28px_rgba(237,123,18,0.26)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >

              {/* Tiger stripe effect */}
              <span className="pointer-events-none absolute inset-0 opacity-[0.09] [background:repeating-linear-gradient(135deg,transparent_0,transparent_12px,#000_12px,#000_14px)]" />

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  <span>
                    Verifying...
                  </span>
                </>
              ) : (
                <>
                  <PawPrint
                    size={18}
                    strokeWidth={2.2}
                  />

                  <span>
                    Login
                  </span>
                </>
              )}

            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-[11px] text-[#aaa]">
            Authorized Forest Personnel
            <span className="mx-2 text-[#d5d5d5]">
              •
            </span>
            <span className="text-[#e97813]">
              VanDrishti
            </span>
          </div>

        </section>

      </div>

    </main>
  );
}