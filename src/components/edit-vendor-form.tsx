"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface VendorFormData {
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
  pan_number: string;
  gst_number: string;
  tan_number: string;
  bank_name: string;
  bank_account_number: string;
  ifsc_code: string;
  branch_name: string;
  website: string;
  description: string;
}

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

export default function EditVendorForm({
  vendor,
  onSuccess,
}: {
  vendor: Vendor;
  onSuccess?: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<VendorFormData>({
    company_name: vendor.company_name || "",
    legal_name: vendor.legal_name || "",
    vendor_type: vendor.vendor_type || "",
    industry_category: vendor.industry_category || "",
    contact_person: vendor.contact_person || "",
    email: vendor.email || "",
    phone: vendor.phone || "",
    alternate_phone: vendor.alternate_phone || "",
    address_line1: vendor.address_line1 || "",
    address_line2: vendor.address_line2 || "",
    city: vendor.city || "",
    state: vendor.state || "",
    pincode: vendor.pincode || "",
    pan_number: vendor.pan_number || "",
    gst_number: vendor.gst_number || "",
    tan_number: vendor.tan_number || "",
    bank_name: vendor.bank_name || "",
    bank_account_number: vendor.bank_account_number || "",
    ifsc_code: vendor.ifsc_code || "",
    branch_name: vendor.branch_name || "",
    website: vendor.website || "",
    description: vendor.description || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation functions
  const validatePAN = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  const validateGST = (gst: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !formData.company_name ||
        !formData.pan_number ||
        !formData.gst_number
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate PAN format
      if (!validatePAN(formData.pan_number)) {
        throw new Error("Please enter a valid PAN number (e.g., AAAAA1234A)");
      }

      // Validate GST format
      if (!validateGST(formData.gst_number)) {
        throw new Error("Please enter a valid GST number (e.g., 12AAAAA1234AAAAA)");
      }

      // Validate phone number if provided
      if (formData.phone && !validatePhone(formData.phone)) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      // Validate alternate phone number if provided
      if (formData.alternate_phone && !validatePhone(formData.alternate_phone)) {
        throw new Error("Please enter a valid 10-digit alternate phone number");
      }

      // Validate pincode if provided
      if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
        throw new Error("Please enter a valid 6-digit pincode");
      }

      // Update vendor data
      const { data, error } = await supabase
        .from("vendors")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vendor.id)
        .select();

      if (error) throw error;

      setSuccess(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to vendor dashboard after successful update
      setTimeout(() => {
        router.push("/vendor-dashboard"); // Navigate back to vendor dashboard
      }, 2000);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while updating the vendor information"
      );
      // Reset success state if there was an error
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Indian states for dropdown
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
  ];

  // Vendor types
  const vendorTypes = [
    "Manufacturer",
    "Supplier",
    "Service Provider",
    "Distributor",
    "Consultant",
    "Contractor",
    "Agent",
    "Other",
  ];

  // Industry categories
  const industryCategories = [
    "Manufacturing",
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Retail",
    "Construction",
    "Transportation",
    "Food & Beverage",
    "Energy",
    "Telecommunications",
    "Media",
    "Agriculture",
    "Pharmaceutical",
    "Automotive",
    "Textile",
    "Chemical",
    "Real Estate",
    "Hospitality",
    "Other",
  ];

  if (success) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-green-800">
            Vendor Information Updated Successfully!
          </h3>
          <p className="mt-2 text-green-700">
            Your vendor information has been updated successfully. Redirecting
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
            Edit Vendor Information
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Update your vendor details below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 text-black">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
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

              <div>
                <label
                  htmlFor="legal_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Legal Name
                </label>
                <input
                  type="text"
                  id="legal_name"
                  name="legal_name"
                  value={formData.legal_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="vendor_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vendor Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="vendor_type"
                  name="vendor_type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Vendor Type</option>
                  {vendorTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="industry_category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Industry Category
                </label>
                <select
                  id="industry_category"
                  name="industry_category"
                  value={formData.industry_category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Industry Category</option>
                  {industryCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="contact_person"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contact_person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                />
              </div>

              <div>
                <label
                  htmlFor="alternate_phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  id="alternate_phone"
                  name="alternate_phone"
                  value={formData.alternate_phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700"
                >
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="address_line1"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="address_line2"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tax Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tax Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="pan_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pan_number"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="AAAAA1234A"
                />
              </div>

              <div>
                <label
                  htmlFor="gst_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  GST Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="gst_number"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="12AAAAA1234AAAAA"
                />
                {/* Remove GST validation success message as validation is now done at form submission */}
              </div>

              <div>
                <label
                  htmlFor="tan_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  TAN Number
                </label>
                <input
                  type="text"
                  id="tan_number"
                  name="tan_number"
                  value={formData.tan_number}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="AAAA12345A"
                />
              </div>
            </div>
          </div>

          {/* Banking Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Banking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="bank_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="bank_account_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Account Number
                </label>
                <input
                  type="text"
                  id="bank_account_number"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="ifsc_code"
                  className="block text-sm font-medium text-gray-700"
                >
                  IFSC Code
                </label>
                <input
                  type="text"
                  id="ifsc_code"
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="ABCD0123456"
                />
              </div>

              <div>
                <label
                  htmlFor="branch_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Branch Name
                </label>
                <input
                  type="text"
                  id="branch_name"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Additional Information
            </h3>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Brief description about your company and services..."
              />
            </div>
          </div>

          {/* Submit Button - No Cancel Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Vendor Information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
