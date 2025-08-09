"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faStar,
  faCrown,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";

export default function SubscriptionPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  const plans = [
    {
      id: "free",
      name: "Free",
      icon: faRocket,
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: [
        "Videos under 10 minutes",
        "Basic text formatting",
        "Up to 10 summary per month",
      ],
      popular: false,
      cta: "Get Started Free",
    },
    {
      id: "pro",
      name: "Pro",
      icon: faStar,
      price: { monthly: 19, yearly: 190 },
      description: "Best for content creators",
      features: [
        "Unlimited transcription",
        "Advanced text formatting",
        "Unlimited use of the summary feature",
        "AI chatbox",
      ],
      popular: true,
      cta: "Start Pro Trial",
    },
  ];

  const getSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { savings, percentage };
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-[#0a0a0a] via-[#10172a] to-[#1a233a]"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? "text-[#e0e7ef]" : "text-gray-900"
            }`}
          >
            Choose Your Plan
          </h1>
          <p
            className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? "text-[#a0aec0]" : "text-gray-600"
            }`}
          >
            Unlock the full potential of video transcription with our flexible
            pricing plans. Start free and scale as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div
            className={`${
              isDarkMode ? "bg-[#223056]" : "bg-white"
            } rounded-full p-1 shadow-lg`}
          >
            <div className="flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white shadow-md"
                    : isDarkMode
                    ? "text-[#a0aec0] hover:text-[#e0e7ef]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white shadow-md"
                    : isDarkMode
                    ? "text-[#a0aec0] hover:text-[#e0e7ef]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Yearly
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Save up to 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const savings = getSavings(plan.price.monthly, plan.price.yearly);
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  isDarkMode ? "bg-[#223056]" : "bg-white"
                } ${
                  isSelected
                    ? isDarkMode
                      ? "border-blue-500 ring-4 ring-[#1a233a]"
                      : "border-blue-500 ring-4 ring-blue-100"
                    : isDarkMode
                    ? "border-[#2d3a5a] hover:border-blue-300"
                    : "border-gray-200 hover:border-blue-300"
                } ${plan.popular ? "scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                        isDarkMode ? "bg-[#1a233a]" : "bg-blue-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={plan.icon}
                        className={`w-8 h-8 ${
                          isDarkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? "text-[#e0e7ef]" : "text-gray-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`${
                        isDarkMode ? "text-[#a0aec0]" : "text-gray-600"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span
                        className={`text-4xl font-bold ${
                          isDarkMode ? "text-[#e0e7ef]" : "text-gray-900"
                        }`}
                      >
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span
                          className={`ml-2 ${
                            isDarkMode ? "text-[#718096]" : "text-gray-500"
                          }`}
                        >
                          /{billingCycle === "monthly" ? "mo" : "year"}
                        </span>
                      )}
                    </div>
                    {billingCycle === "yearly" && plan.price.yearly > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        Save ${savings.savings} ({savings.percentage}%)
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                        />
                        <span
                          className={`${
                            isDarkMode ? "text-[#a0aec0]" : "text-gray-700"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      plan.id === "free"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        : plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2
            className={`text-3xl font-bold text-center mb-12 ${
              isDarkMode ? "text-[#e0e7ef]" : "text-gray-900"
            }`}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "Can I change my plan at any time?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.",
              },
              {
                question: "Is there a free trial?",
                answer:
                  "Yes! All paid plans come with a 7-day free trial. No credit card required to start.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
              },
              {
                question: "Can I cancel my subscription?",
                answer:
                  "Absolutely. You can cancel your subscription at any time from your account settings. No long-term contracts or cancellation fees.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg p-6 shadow-md ${
                  isDarkMode ? "bg-[#223056]" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-[#e0e7ef]" : "text-gray-900"
                  }`}
                >
                  {faq.question}
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-[#a0aec0]" : "text-gray-600"
                  }`}
                >
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2
            className={`text-3xl font-bold mb-6 ${
              isDarkMode ? "text-[#e0e7ef]" : "text-gray-900"
            }`}
          >
            Need to transcribe?
          </h2>
          <p
            className={`text-xl mb-8 ${
              isDarkMode ? "text-[#a0aec0]" : "text-gray-600"
            }`}
          >
            Start transcribing your videos right now with our powerful tools
          </p>
          <button
            onClick={() => router.push("/")}
            className={`px-8 py-4 rounded-xl font-semibold transition-colors duration-200 ${
              isDarkMode
                ? "bg-[#e0e7ef] text-[#10172a] hover:bg-[#cbd5e1]"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            Start Transcribing
          </button>
        </div>
      </div>
    </div>
  );
}
