"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CompanyOnboardingForm from "@/components/company-onboarding-form";

interface CompanyContact {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  designation: string;
  status: string;
  is_active: boolean;
}

export default function CompanyOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [companyContact, setCompanyContact] = useState<CompanyContact | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    } else {
      checkExistingCompanyContact();
    }
  }, [user, router]);

  const checkExistingCompanyContact = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("company_contacts")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned
        throw error;
      }

      setCompanyContact(data || null);
    } catch (error) {
      console.error("Error checking company contact:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If company contact data exists, redirect to dashboard
  if (companyContact) {
    router.push("/dashboard");
    return null;
  }

  // If no company contact data exists, show onboarding form
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Company Contact Onboarding
          </h1>
          <p className="mt-1 text-gray-600">
            Please complete your company contact registration to get started.
          </p>
        </div>

        <CompanyOnboardingForm />
      </div>
    </div>
  );
}
