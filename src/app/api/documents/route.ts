import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    // If vendorId is provided, we're fetching documents for a specific vendor (company contact view)
    if (vendorId) {
      // Check if user is a company contact
      const { data: companyContact, error: companyError } = await supabase
        .from("company_contacts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (companyError || !companyContact) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Fetch documents for the specified vendor
      const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (documentsError) {
        console.error("Documents fetch error:", documentsError);
        return NextResponse.json(
          { error: "Failed to fetch documents" },
          { status: 500 }
        );
      }

      // Return documents without signed URLs since we'll handle downloads directly in frontend
      return NextResponse.json({ data: documents });
    }

    // Get the vendor associated with this user (vendor view)
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Fetch documents for this vendor
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("*")
      .eq("vendor_id", vendor.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (documentsError) {
      console.error("Documents fetch error:", documentsError);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    // Return documents without signed URLs since we'll handle downloads directly in frontend
    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
