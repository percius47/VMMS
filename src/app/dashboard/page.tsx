"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">
              Welcome, {user.email}
            </h2>
            <p className="mt-2 text-gray-600">
              This is the Vendor Master Management System dashboard.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/vendor-dashboard"
              className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Vendor Management
                </h3>
                <p className="mt-2 text-gray-600">
                  Manage your vendor information and documentation.
                </p>
              </div>
            </a>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Compliance Tracking
                </h3>
                <p className="mt-2 text-gray-600">
                  Monitor vendor compliance status and requirements.
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Reporting</h3>
                <p className="mt-2 text-gray-600">
                  Generate reports on vendor performance and metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
