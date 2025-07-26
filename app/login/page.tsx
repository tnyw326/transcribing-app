"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeProvider";
import { useLanguage } from "../context/LanguageProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isDarkMode } = useTheme();
  const { currentLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual login logic
    console.log("Login attempt:", { email, password });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        isDarkMode ? "bg-[#0f172a]" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-md w-full space-y-8 ${
          isDarkMode ? "text-[#e0e7ef]" : "text-[#1a202c]"
        }`}
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">
            {currentLanguage === "zh"
              ? "登录账户"
              : currentLanguage === "ja"
              ? "アカウントにログイン"
              : "Sign in to your account"}
          </h2>
          <p
            className={`mt-2 text-sm ${
              isDarkMode ? "text-[#94a3b8]" : "text-gray-600"
            }`}
          >
            {currentLanguage === "zh"
              ? "或"
              : currentLanguage === "ja"
              ? "または"
              : "Or "}
            <Link
              href="/signup"
              className={`font-medium hover:underline ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {currentLanguage === "zh"
                ? "创建新账户"
                : currentLanguage === "ja"
                ? "新しいアカウントを作成"
                : "create a new account"}
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-[#e0e7ef]" : "text-gray-700"
                }`}
              >
                {currentLanguage === "zh"
                  ? "邮箱地址"
                  : currentLanguage === "ja"
                  ? "メールアドレス"
                  : "Email address"}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-[#1e293b] border-[#334155] text-[#e0e7ef] placeholder-[#64748b] focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder={
                    currentLanguage === "zh"
                      ? "输入您的邮箱"
                      : currentLanguage === "ja"
                      ? "メールアドレスを入力"
                      : "Enter your email"
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-[#e0e7ef]" : "text-gray-700"
                }`}
              >
                {currentLanguage === "zh"
                  ? "密码"
                  : currentLanguage === "ja"
                  ? "パスワード"
                  : "Password"}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-[#1e293b] border-[#334155] text-[#e0e7ef] placeholder-[#64748b] focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder={
                    currentLanguage === "zh"
                      ? "输入您的密码"
                      : currentLanguage === "ja"
                      ? "パスワードを入力"
                      : "Enter your password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDarkMode
                      ? "text-[#64748b] hover:text-[#94a3b8]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded border-gray-300 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-[#1e293b] border-[#334155]"
                    : "bg-white border-gray-300"
                }`}
              />
              <label
                htmlFor="remember-me"
                className={`ml-2 block text-sm ${
                  isDarkMode ? "text-[#94a3b8]" : "text-gray-900"
                }`}
              >
                {currentLanguage === "zh"
                  ? "记住我"
                  : currentLanguage === "ja"
                  ? "ログイン状態を保持"
                  : "Remember me"}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className={`font-medium hover:underline ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {currentLanguage === "zh"
                  ? "忘记密码？"
                  : currentLanguage === "ja"
                  ? "パスワードを忘れた？"
                  : "Forgot your password?"}
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {currentLanguage === "zh"
                    ? "登录中..."
                    : currentLanguage === "ja"
                    ? "ログイン中..."
                    : "Signing in..."}
                </div>
              ) : currentLanguage === "zh" ? (
                "登录"
              ) : currentLanguage === "ja" ? (
                "ログイン"
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t ${
                  isDarkMode ? "border-[#334155]" : "border-gray-300"
                }`}
              />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className={`px-2 ${
                  isDarkMode
                    ? "bg-[#0f172a] text-[#64748b]"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                {currentLanguage === "zh"
                  ? "或继续使用"
                  : currentLanguage === "ja"
                  ? "または以下で続行"
                  : "Or continue with"}
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols gap-3">
            <button
              type="button"
              className={`w-full inline-flex justify-center py-2 px-4 border rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 ${
                isDarkMode
                  ? "bg-[#1e293b] border-[#334155] text-[#e0e7ef] hover:bg-[#334155]"
                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="ml-2">
                {currentLanguage === "zh"
                  ? "Google"
                  : currentLanguage === "ja"
                  ? "Google"
                  : "Google"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
