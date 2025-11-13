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
      return NextResponse.json({ role: "vendor" });
    }

    // Check if user is a company contact
    const { data: companyData, error: companyError } = await supabase
      .from("company_contacts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (companyData && !companyError) {
      return NextResponse.json({ role: "company" });
    }

    // User has no role yet
    return NextResponse.json({ role: "none" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check user role" },
      { status: 500 }
    );
  }
}
