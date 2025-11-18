"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import EditCompanyContactForm from "@/components/edit-company-contact-form";

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

export default function CompanyEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [companyContact, setCompanyContact] = useState<CompanyContact | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchCompanyContactData();
    }
  }, [user, router]);

  const fetchCompanyContactData = async () => {
    try {
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
      console.error("Error fetching company contact data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle successful edit
  const handleEditSuccess = () => {
    // Redirect to company dashboard after successful edit
    router.push("/company-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!companyContact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            No Company Profile Found
          </h2>
          <p className="text-gray-600 mb-6">
            You need to create a company profile first.
          </p>
          <button
            onClick={() => router.push("/company-onboarding")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Company Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Company Profile
          </h1>
          <p className="mt-1 text-gray-600">
            Update your company information below.
          </p>
        </div>

        <EditCompanyContactForm
          companyContact={companyContact}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
}