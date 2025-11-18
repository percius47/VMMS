"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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

export default function CompanyDashboard() {
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
      console.error("Error fetching company contact data:", error);
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

  // If company contact data exists, show dashboard
  if (companyContact) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Company Dashboard
            </h1>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Company Profile
              </h2>
              <div className="mt-1 flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    companyContact.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : companyContact.status === "pending_approval"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {companyContact.status === "approved"
                    ? "Approved"
                    : companyContact.status === "pending_approval"
                    ? "Pending Approval"
                    : "Rejected"}
                </span>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => router.push("/company-edit")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Full Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {companyContact.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {companyContact.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {companyContact.phone || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Designation
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {companyContact.designation || "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Company Information
                  </h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Company Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {companyContact.company_name}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no company contact data exists, show onboarding form
  router.push("/company-onboarding");
  return null;
}
