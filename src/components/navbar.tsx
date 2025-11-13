"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const supabase = createClient();
  const [isVendor, setIsVendor] = useState(false);
  const [isCompanyContact, setIsCompanyContact] = useState(false);
  const [loading, setLoading] = useState(true);

  // Always run the effect, but check if we should do anything
  useEffect(() => {
    const checkUserStatus = async () => {
      // Only check status if we're not on the login page and user exists
      if (pathname !== "/login" && user) {
        try {
          // Check if user is a vendor
          const { data: vendorData, error: vendorError } = await supabase
            .from("vendors")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (vendorError && vendorError.code !== "PGRST116") {
            // PGRST116 means no rows returned
            throw vendorError;
          }

          setIsVendor(!!vendorData);

          // Check if user is a company contact
          const { data: companyData, error: companyError } = await supabase
            .from("company_contacts")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (companyError && companyError.code !== "PGRST116") {
            // PGRST116 means no rows returned
            throw companyError;
          }

          setIsCompanyContact(!!companyData);
        } catch (error) {
          console.error("Error checking user status:", error);
        }
      }
      // Always set loading to false to prevent infinite loading state
      setLoading(false);
    };

    checkUserStatus();
  }, [user, pathname]);

  // Filter nav items based on user role
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    // Only show Vendors tab to company contacts, not to vendors
    ...(isCompanyContact ? [{ name: "Vendors", href: "/vendors" }] : []),
  ];

  // Render nothing on login page
  if (pathname === "/login") {
    return <div style={{ display: "none" }} />;
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">VMMS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
              {/* Show My Vendor Profile link for vendors */}
              {user && isVendor && (
                <Link
                  href="/vendor-dashboard"
                  className={`${
                    pathname === "/vendor-dashboard"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  My Vendor Profile
                </Link>
              )}
              {/* Show Company Dashboard link for company contacts */}
              {user && isCompanyContact && (
                <Link
                  href="/company-dashboard"
                  className={`${
                    pathname === "/company-dashboard"
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Company Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Welcome, {user.email}
                </span>
                {/* Show Create Vendor Profile button for non-vendors and non-company contacts */}
                {!isVendor && !isCompanyContact && !loading && (
                  <Link
                    href="/vendor-dashboard"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2"
                  >
                    Create Vendor Profile
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
