"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import VendorOnboardingForm from "@/components/vendor-onboarding-form";

export default function VendorOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Vendor Onboarding
          </h1>
          <p className="mt-1 text-gray-600">
            Please complete your vendor registration to get started.
          </p>
        </div>

        <VendorOnboardingForm />
      </div>
    </div>
  );
}
