import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a vendor
    const { data: vendorData, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (vendorData && !vendorError) {
      return NextResponse.json({
        hasRole: true,
        role: "vendor",
        redirectUrl: "/vendor-dashboard",
      });
    }

    // Check if user is a company contact
    const { data: companyData, error: companyError } = await supabase
      .from("company_contacts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (companyData && !companyError) {
      return NextResponse.json({
        hasRole: true,
        role: "company",
        redirectUrl: "/company-dashboard",
      });
    }

    // User has no role yet
    return NextResponse.json({
      hasRole: false,
      role: "none",
      redirectUrl: "/role-selection",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check user status" },
      { status: 500 }
    );
  }
}
