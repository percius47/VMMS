"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Vendor {
  id: string;
  company_name: string;
  gst_number: string;
  vendor_type: string;
  status: string;
}

export default function Vendors() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is a company contact
  useEffect(() => {
    const checkUserAuthorization = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Check if user is a company contact
        const { data: companyData, error: companyError } = await supabase
          .from("company_contacts")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!companyData || companyError) {
          // If not a company contact, redirect to vendor dashboard
          router.push("/vendor-dashboard");
          return;
        }

        // If user is a company contact, fetch vendors
        fetchVendors();
      } catch (error) {
        console.error("Error checking user authorization:", error);
        router.push("/vendor-dashboard");
      }
    };

    checkUserAuthorization();
  }, [user, router]);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      // Let's also try a simple count query to see if we can access the table at all
      const { count, error: countError } = await supabase
        .from("vendors")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Count error:", countError);
      }

      // Now fetch the actual data including status
      const { data, error } = await supabase
        .from("vendors")
        .select("id, company_name, gst_number, vendor_type, status");

      if (error) {
        console.error("Supabase error:", error);
        console.error(
          "Error details:",
          error.message,
          error.details,
          error.hint
        );
        throw error;
      }

      // Use the full vendor data directly
      const vendorList = data || [];

      setVendors(vendorList);
      setFilteredVendors(vendorList);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      // Set empty arrays to avoid undefined errors
      setVendors([]);
      setFilteredVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to update vendor status
  const updateVendorStatus = async (vendorId: string, newStatus: string) => {
    // Show confirmation dialog before proceeding
    const confirmChange = window.confirm(
      `Are you sure you want to change this vendor's status to "${newStatus}"? This action cannot be undone.`
    );

    if (!confirmChange) {
      return; // User cancelled the action
    }

    try {
      const response = await fetch(`/api/vendors/${vendorId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update vendor status: ${response.status} ${response.statusText}`
        );
      }

      const { data } = await response.json();

      // Update the local state
      setVendors((prevVendors) =>
        prevVendors.map((vendor) =>
          vendor.id === vendorId ? { ...vendor, status: newStatus } : vendor
        )
      );

      setFilteredVendors((prevFilteredVendors) =>
        prevFilteredVendors.map((vendor) =>
          vendor.id === vendorId ? { ...vendor, status: newStatus } : vendor
        )
      );

      // Show success message
      alert("Vendor status updated successfully");
    } catch (error: any) {
      console.error("Error updating vendor status:", error);
      alert(`Failed to update vendor status: ${error.message}`);
    }
  };

  // Filter vendors based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVendors(vendors);
      return;
    }

    const filtered = vendors.filter(
      (vendor) =>
        vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.gst_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.vendor_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredVendors(filtered);
  }, [searchTerm, vendors]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Directory</h1>
          <p className="mt-1 text-gray-600">
            Browse and search vendor information
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search vendors by company name, GST, or vendor type..."
                    value={searchTerm || ""}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={fetchVendors}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Debug info */}
          <div className="px-6 py-2 bg-gray-100 border-b border-gray-200 text-sm text-gray-600">
            <p>Vendors count: {vendors ? vendors.length : "Loading..."}</p>
            <p>
              Filtered vendors count:{" "}
              {filteredVendors ? filteredVendors.length : "Loading..."}
            </p>
            <p>Loading state: {loading ? "true" : "false"}</p>
          </div>

          {/* Vendors Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Company Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    GST Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vendor Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
                        Loading vendors...
                      </div>
                    </td>
                  </tr>
                ) : filteredVendors && filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          onClick={() =>
                            router.push(`/vendor-profile/${vendor.id}`)
                          }
                          className="text-indigo-600 hover:text-indigo-900 hover:underline focus:outline-none"
                        >
                          {vendor.company_name || "N/A"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vendor.gst_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {vendor.vendor_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          {vendor.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={vendor.status || "active"}
                          onChange={(e) =>
                            updateVendorStatus(vendor.id, e.target.value)
                          }
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                          <option value="blacklisted">Blacklisted</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "No vendors found matching your search."
                        : "No vendors available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {filteredVendors ? filteredVendors.length : 0}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {vendors ? vendors.length : 0}
              </span>{" "}
              vendors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
