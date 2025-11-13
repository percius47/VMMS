"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import VendorOnboardingForm from "@/components/vendor-onboarding-form";
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

export default function VendorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [hideEditButton, setHideEditButton] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchVendorData();
    }
  }, [user, router]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);

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
    setHideEditButton(true);
    setEditing(false); // Exit editing mode
    // Refresh the vendor data after a short delay to ensure the DB is updated
    setTimeout(() => {
      fetchVendorData();
    }, 1000);
  };

  // Handle edit toggle (for both Edit and Cancel buttons)
  const handleEditToggle = () => {
    // If we were in editing mode and are canceling, show the edit button again
    if (editing) {
      setHideEditButton(false);
    }
    setEditing(!editing);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If vendor data exists, show dashboard, otherwise show onboarding form
  if (vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Vendor Dashboard
            </h1>
            {
              <button
                onClick={handleEditToggle}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editing ? "Cancel Edit" : "Edit Profile"}
              </button>
            }
          </div>

          {editing ? (
            <EditVendorForm vendor={vendor} onSuccess={handleEditSuccess} />
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Vendor Profile
                </h2>
                <div className="mt-1 flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vendor.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : vendor.status === "pending_approval"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vendor.status === "approved"
                      ? "Approved"
                      : vendor.status === "pending_approval"
                      ? "Pending Approval"
                      : "Rejected"}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {vendor.company_name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Legal Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.legal_name || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Vendor Type
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.vendor_type}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Industry Category
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.industry_category || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Website
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.website ? (
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              {vendor.website}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <dl className="grid grid-cols-1 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Contact Person
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.contact_person || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Email
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.phone || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Alternate Phone
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.alternate_phone || "N/A"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Address Information
                    </h3>
                    <dl className="grid grid-cols-1 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.address_line1}
                          {vendor.address_line2 && (
                            <>
                              <br />
                              {vendor.address_line2}
                            </>
                          )}
                          <br />
                          {vendor.city}, {vendor.state} - {vendor.pincode}
                          <br />
                          {vendor.country}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Tax Information
                    </h3>
                    <dl className="grid grid-cols-1 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          PAN Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.pan_number}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          GST Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.gst_number}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          TAN Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.tan_number || "N/A"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Banking Information
                    </h3>
                    <dl className="grid grid-cols-1 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Bank Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.bank_name || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Account Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.bank_account_number
                            ? "****" + vendor.bank_account_number.slice(-4)
                            : "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          IFSC Code
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.ifsc_code || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Branch Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {vendor.branch_name || "N/A"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Description
                    </h3>
                    <p className="text-sm text-gray-900">
                      {vendor.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If no vendor data exists, show onboarding form
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
