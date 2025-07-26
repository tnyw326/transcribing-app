"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeProvider";
import { useLanguage } from "../context/LanguageProvider";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isDarkMode } = useTheme();
  const { currentLanguage } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName =
        currentLanguage === "zh"
          ? "请输入名字"
          : currentLanguage === "ja"
          ? "名前を入力してください"
          : "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName =
        currentLanguage === "zh"
          ? "请输入姓氏"
          : currentLanguage === "ja"
          ? "姓を入力してください"
          : "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        currentLanguage === "zh"
          ? "请输入邮箱地址"
          : currentLanguage === "ja"
          ? "メールアドレスを入力してください"
          : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email =
        currentLanguage === "zh"
          ? "请输入有效的邮箱地址"
          : currentLanguage === "ja"
          ? "有効なメールアドレスを入力してください"
          : "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password =
        currentLanguage === "zh"
          ? "请输入密码"
          : currentLanguage === "ja"
          ? "パスワードを入力してください"
          : "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password =
        currentLanguage === "zh"
          ? "密码至少需要8个字符"
          : currentLanguage === "ja"
          ? "パスワードは8文字以上である必要があります"
          : "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        currentLanguage === "zh"
          ? "请确认密码"
          : currentLanguage === "ja"
          ? "パスワードを確認してください"
          : "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        currentLanguage === "zh"
          ? "密码不匹配"
          : currentLanguage === "ja"
          ? "パスワードが一致しません"
          : "Passwords do not match";
    }

    if (!agreeToTerms) {
      newErrors.terms =
        currentLanguage === "zh"
          ? "请同意服务条款"
          : currentLanguage === "ja"
          ? "利用規約に同意してください"
          : "Please agree to the terms of service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual signup logic
    console.log("Signup attempt:", formData);

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
              ? "创建账户"
              : currentLanguage === "ja"
              ? "アカウントを作成"
              : "Create your account"}
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
              href="/login"
              className={`font-medium hover:underline ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {currentLanguage === "zh"
                ? "登录现有账户"
                : currentLanguage === "ja"
                ? "既存のアカウントにログイン"
                : "sign in to your existing account"}
            </Link>
          </p>
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-[#e0e7ef]" : "text-gray-700"
                  }`}
                >
                  {currentLanguage === "zh"
                    ? "名字"
                    : currentLanguage === "ja"
                    ? "名前"
                    : "First name"}
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                      errors.firstName
                        ? "border-red-500 focus:ring-red-500"
                        : isDarkMode
                        ? "bg-[#1e293b] border-[#334155] text-[#e0e7ef] placeholder-[#64748b] focus:ring-blue-500 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder={
                      currentLanguage === "zh"
                        ? "输入名字"
                        : currentLanguage === "ja"
                        ? "名前を入力"
                        : "Enter first name"
                    }
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-[#e0e7ef]" : "text-gray-700"
                  }`}
                >
                  {currentLanguage === "zh"
                    ? "姓氏"
                    : currentLanguage === "ja"
                    ? "姓"
                    : "Last name"}
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                      errors.lastName
                        ? "border-red-500 focus:ring-red-500"
                        : isDarkMode
                        ? "bg-[#1e293b] border-[#334155] text-[#e0e7ef] placeholder-[#64748b] focus:ring-blue-500 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder={
                      currentLanguage === "zh"
                        ? "输入姓氏"
                        : currentLanguage === "ja"
                        ? "姓を入力"
                        : "Enter last name"
                    }
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : isDarkMode
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
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : isDarkMode
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-[#e0e7ef]" : "text-gray-700"
                }`}
              >
                {currentLanguage === "zh"
                  ? "确认密码"
                  : currentLanguage === "ja"
                  ? "パスワード確認"
                  : "Confirm password"}
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-3 pr-10 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : isDarkMode
                      ? "bg-[#1e293b] border-[#334155] text-[#e0e7ef] placeholder-[#64748b] focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder={
                    currentLanguage === "zh"
                      ? "再次输入密码"
                      : currentLanguage === "ja"
                      ? "パスワードを再入力"
                      : "Confirm your password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDarkMode
                      ? "text-[#64748b] hover:text-[#94a3b8]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className={`h-4 w-4 rounded border-gray-300 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-[#1e293b] border-[#334155]"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="agree-terms"
                className={`${isDarkMode ? "text-[#94a3b8]" : "text-gray-900"}`}
              >
                {currentLanguage === "zh" ? (
                  <>
                    我同意{" "}
                    <Link
                      href="/terms"
                      className={`font-medium hover:underline ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      服务条款
                    </Link>{" "}
                    和{" "}
                    <Link
                      href="/privacy"
                      className={`font-medium hover:underline ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      隐私政策
                    </Link>
                  </>
                ) : currentLanguage === "ja" ? (
                  <>
                    <Link
                      href="/terms"
                      className={`font-medium hover:underline ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      利用規約
                    </Link>{" "}
                    と{" "}
                    <Link
                      href="/privacy"
                      className={`font-medium hover:underline ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      プライバシーポリシー
                    </Link>{" "}
                    に同意します
                  </>
                ) : (
                  <>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className={`font-medium hover:underline ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className={`font-medium hover:underline ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      Privacy Policy
                    </Link>
                  </>
                )}
              </label>
            </div>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-500">{errors.terms}</p>
          )}

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
                    ? "创建账户中..."
                    : currentLanguage === "ja"
                    ? "アカウント作成中..."
                    : "Creating account..."}
                </div>
              ) : currentLanguage === "zh" ? (
                "创建账户"
              ) : currentLanguage === "ja" ? (
                "アカウントを作成"
              ) : (
                "Create account"
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

          {/* Social Signup Buttons */}
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
                  ? "使用Google注册"
                  : currentLanguage === "ja"
                  ? "Googleで登録"
                  : "Sign up with Google"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
