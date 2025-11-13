"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function RoleSelection() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // Check if user already exists in company_contacts or vendors table
      // Check company_contacts table
      const { data: companyContact, error: companyError } = await supabase
        .from("company_contacts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (companyContact && !companyError) {
        // User is a company contact, redirect to company dashboard
        router.push("/company-dashboard");
        return;
      }

      // Check vendors table
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (vendor && !vendorError) {
        // User is a vendor, redirect to vendor dashboard
        router.push("/vendor-dashboard");
        return;
      }
    };

    checkUserProfile();
  }, [user, router]);

  const handleRoleSelection = (role: "vendor" | "company") => {
    if (role === "vendor") {
      router.push("/vendor-onboarding");
    } else {
      router.push("/company-onboarding");
    }
  };

  // If user profile is being checked or user doesn't exist, show nothing
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Select Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please select the role that best describes you
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => handleRoleSelection("vendor")}
              className="relative bg-white border border-gray-300 rounded-lg shadow-sm p-6 flex focus:outline-none hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <h3 className="font-medium text-gray-900">
                      <span
                        className="absolute inset-0"
                        aria-hidden="true"
                      ></span>
                      I am a Vendor
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Register as a vendor to provide services or products
                    </p>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelection("company")}
              className="relative bg-white border border-gray-300 rounded-lg shadow-sm p-6 flex focus:outline-none hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <h3 className="font-medium text-gray-900">
                      <span
                        className="absolute inset-0"
                        aria-hidden="true"
                      ></span>
                      I am a Company Representative
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Register as a company contact to manage vendor
                      relationships
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
