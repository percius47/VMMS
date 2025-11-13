"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        try {
          // Check if user is a vendor
          const { data: vendorData, error: vendorError } = await supabase
            .from("vendors")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (vendorData && !vendorError) {
            router.push("/vendor-dashboard");
            return;
          }

          // Check if user is a company contact
          const { data: companyData, error: companyError } = await supabase
            .from("company_contacts")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (companyData && !companyError) {
            router.push("/company-dashboard");
            return;
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
      setLoading(false);
    };

    checkUserRole();
  }, [user, router, supabase]);

  if (!user) {
    router.push("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user has no role yet, show role selection
  router.push("/role-selection");
  return null;
}
