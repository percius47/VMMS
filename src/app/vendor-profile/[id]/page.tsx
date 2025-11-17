"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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

interface VendorDocument {
  id: string;
  vendor_id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function VendorProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      checkUserAuthorization();
    }
  }, [user, router]);

  const checkUserAuthorization = async () => {
    try {
      // Check if user is a company contact
      const { data: companyData, error: companyError } = await supabase
        .from("company_contacts")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!companyData || companyError) {
        // If not a company contact, redirect to vendor dashboard
        router.push("/vendor-dashboard");
        return;
      }

      fetchVendorData();
      fetchVendorDocuments();
    } catch (error) {
      console.error("Error checking user authorization:", error);
      router.push("/vendor-dashboard");
    }
  };

  const fetchVendorData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", id)
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

  const fetchVendorDocuments = async () => {
    try {
      setDocumentsLoading(true);

      // Fetch documents for the specified vendor using the updated documents API endpoint
      const response = await fetch(`/api/documents?vendorId=${id}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch vendor documents: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();

      // Check if result has data property
      if (result && Array.isArray(result)) {
        // If result is directly an array (old format)
        setDocuments(result);
      } else if (result && result.data && Array.isArray(result.data)) {
        // If result has data property (new format)
        setDocuments(result.data);
      } else {
        // If no data or invalid format
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching vendor documents:", error);
      // Show user-friendly error message
      alert("Failed to load vendor documents. Please try again.");
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDownload = async (vendorDocument: VendorDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from("vendor-documents")
        .download(vendorDocument.file_name);

      if (error) {
        console.error("Error downloading file:", error);
        alert("Failed to download document: " + error.message);
        return;
      }

      if (!data) {
        alert("Download failed: No data received");
        return;
      }

      // Create a URL for the blob data
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = vendorDocument.original_name;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert(
        "Failed to download document: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return "📷";
    } else if (fileType.includes("pdf")) {
      return "📄";
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return "📝";
    } else {
      return "📁";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            Vendor Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The vendor profile you're looking for doesn't exist or is
            unavailable.
          </p>
          <button
            onClick={() => router.push("/vendors")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Vendor Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/vendors")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
          >
            ← Back to Vendor Directory
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="mt-1 text-gray-600">
            View vendor details and documents
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {vendor.company_name}
            </h2>
            <div className="mt-1 flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vendor.status === "active"
                    ? "bg-green-100 text-green-800"
                    : vendor.status === "disabled"
                    ? "bg-yellow-100 text-yellow-800"
                    : vendor.status === "blacklisted"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {vendor.status === "active"
                  ? "Active"
                  : vendor.status === "disabled"
                  ? "Disabled"
                  : vendor.status === "blacklisted"
                  ? "Blacklisted"
                  : vendor.status || "Active"}
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
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {vendor.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
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

        <div className="mt-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Vendor Documents
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                All documents uploaded by this vendor
              </p>
            </div>
            <div className="px-6 py-4">
              {documentsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No documents
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This vendor has not uploaded any documents yet.
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {documents.map((vendorDocument) => (
                    <li
                      key={vendorDocument.id}
                      className="relative col-span-1 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex-1 flex flex-col p-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                          <span className="text-2xl">
                            {getFileIcon(vendorDocument.file_type)}
                          </span>
                        </div>
                        <div className="mt-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {vendorDocument.original_name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatFileSize(vendorDocument.file_size)}
                          </p>
                          {vendorDocument.description && (
                            <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                              {vendorDocument.description}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-gray-400">
                            {formatDate(vendorDocument.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200">
                        <div className="-mt-px flex divide-x divide-gray-200">
                          <div className="flex-1 flex">
                            <button
                              onClick={() => handleDownload(vendorDocument)}
                              className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-3 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                ></path>
                              </svg>
                              <span className="ml-2">Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
