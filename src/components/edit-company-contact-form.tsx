"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface CompanyContactFormData {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  designation: string;
}

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

export default function EditCompanyContactForm({
  companyContact,
  onSuccess,
}: {
  companyContact: CompanyContact;
  onSuccess?: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<CompanyContactFormData>({
    name: companyContact.name || "",
    email: companyContact.email || "",
    phone: companyContact.phone || "",
    company_name: companyContact.company_name || "",
    designation: companyContact.designation || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.company_name) {
        throw new Error("Please fill in all required fields");
      }

      // Validate email format
      if (!validateEmail(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate phone number if provided
      if (formData.phone && !validatePhone(formData.phone)) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      // Update company contact data
      const { data, error } = await supabase
        .from("company_contacts")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyContact.id)
        .select();

      if (error) throw error;

      setSuccess(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to company dashboard after successful update
      setTimeout(() => {
        router.push("/company-dashboard");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while updating the company information"
      );
      // Reset success state if there was an error
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-green-800">
            Company Information Updated Successfully!
          </h3>
          <p className="mt-2 text-green-700">
            Your company information has been updated successfully. Redirecting
            to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Company Information
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Update your company contact details below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 text-black">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Contact Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="10-digit phone number"
                />
                {formData.phone && !validatePhone(formData.phone) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please enter a valid 10-digit phone number
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-gray-700"
                >
                  Designation
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Company Information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}