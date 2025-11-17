"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  disabledVendors: number;
  blacklistedVendors: number;
}

interface CompanyContactStats {
  totalContacts: number;
  approvedContacts: number;
  pendingContacts: number;
  rejectedContacts: number;
}

interface SystemStats {
  totalUsers: number;
  totalVendors: number;
  totalCompanyContacts: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyContactStats | null>(
    null
  );
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      // In a real application, you would check if the user is an admin
      // For now, we'll assume the user has admin privileges
      fetchStats();
    }
  }, [user, router]);

  const fetchStats = async () => {
    try {
      // Fetch vendor statistics
      const vendorResponse = await fetch("/api/vendors/stats");
      const vendorData = await vendorResponse.json();

      if (vendorResponse.ok) {
        setVendorStats(vendorData);
      }

      // Fetch company contact statistics
      const companyResponse = await fetch("/api/company-contacts/stats");
      const companyData = await companyResponse.json();

      if (companyResponse.ok) {
        setCompanyStats(companyData);
      }

      // Fetch system statistics
      const systemResponse = await fetch("/api/stats");
      const systemData = await systemResponse.json();

      if (systemResponse.ok) {
        setSystemStats(systemData);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">System overview and statistics</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {systemStats?.totalUsers || 0}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendors</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {systemStats?.totalVendors || 0}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Company Contacts
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {systemStats?.totalCompanyContacts || 0}
            </p>
          </div>
        </div>

        {/* Vendor Stats */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vendor Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorStats?.totalVendors || 0}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {vendorStats?.activeVendors || 0}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Disabled</p>
              <p className="text-2xl font-bold text-yellow-600">
                {vendorStats?.disabledVendors || 0}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Blacklisted</p>
              <p className="text-2xl font-bold text-red-600">
                {vendorStats?.blacklistedVendors || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Company Contact Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Company Contact Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {companyStats?.totalContacts || 0}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {companyStats?.approvedContacts || 0}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {companyStats?.pendingContacts || 0}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {companyStats?.rejectedContacts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
