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

    // Get overall system statistics
    const { count: totalUsers, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: totalVendors, error: vendorError } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true });

    const { count: totalCompanyContacts, error: companyError } = await supabase
      .from("company_contacts")
      .select("*", { count: "exact", head: true });

    if (userError || vendorError || companyError) {
      return NextResponse.json(
        { error: "Failed to fetch system statistics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalVendors: totalVendors || 0,
      totalCompanyContacts: totalCompanyContacts || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch system statistics" },
      { status: 500 }
    );
  }
}
