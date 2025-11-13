"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import EditVendorForm from "@/components/edit-vendor-form";

interface Vendor {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company_name: string;
  legal_name: string;
  vendor_type: string;
  industry_category: string;
  contact_person: string;
  email: string;
  phone: string;
  alternate_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  pan_number: string;
  gst_number: string;
  tan_number: string;
  bank_name: string;
  bank_account_number: string;
  ifsc_code: string;
  branch_name: string;
  pan_document_url: string;
  gst_document_url: string;
  incorporation_document_url: string;
  address_proof_document_url: string;
  status: string;
  is_active: boolean;
  website: string;
  description: string;
}

export default function VendorEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchVendorData();
    }
  }, [user, router]);

  const fetchVendorData = async () => {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned
        throw error;
      }

      setVendor(data || null);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle successful edit
  const handleEditSuccess = () => {
    // Redirect to vendor dashboard after successful edit
    router.push("/vendor-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            No Vendor Profile Found
          </h2>
          <p className="text-gray-600 mb-6">
            You need to create a vendor profile first.
          </p>
          <button
            onClick={() => router.push("/vendor-onboarding")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Vendor Profile
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
            Edit Vendor Profile
          </h1>
          <p className="mt-1 text-gray-600">
            Update your vendor information below.
          </p>
        </div>

        <EditVendorForm vendor={vendor} onSuccess={handleEditSuccess} />
      </div>
    </div>
  );
}
