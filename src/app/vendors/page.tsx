"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Vendor {
  id: number;
  name: string;
  type: string;
  region: string;
}

export default function Vendors() {
  const { user } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    } else {
      // Fetch vendors from Supabase
      fetchVendors();
    }
  }, [user, router]);

  const fetchVendors = async () => {
    try {
      // This would be replaced with actual Supabase query
      // const { data, error } = await supabase.from('vendors').select('*');
      // if (error) throw error;
      // setVendors(data);

      // Mock data for now
      setVendors([
        {
          id: 1,
          name: "ABC Corporation",
          type: "Supplier",
          region: "North America",
        },
        {
          id: 2,
          name: "XYZ Industries",
          type: "Service Provider",
          region: "Europe",
        },
        {
          id: 3,
          name: "PQR Solutions",
          type: "Consultant",
          region: "Asia Pacific",
        },
      ]);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Vendor Management
                </h3>
                <a
                  href="/vendor-dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  My Vendor Profile
                </a>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-gray-600 mb-4">
                  Manage your vendor information and documentation.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700">
                    Click "My Vendor Profile" to view or update your vendor
                    information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
