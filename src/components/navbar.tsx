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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    // { name: "Dashboard", href: "/dashboard" },
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
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu icon when closed */}
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                // Close icon when open
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
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
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
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
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Company Dashboard
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {user ? (
                <div className="flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, {user.email}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="mt-3 space-y-1">
              {user ? (
                <>
                  {/* Show Create Vendor Profile button for non-vendors and non-company contacts */}
                  {!isVendor && !isCompanyContact && !loading && (
                    <Link
                      href="/vendor-dashboard"
                      className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Vendor Profile
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
