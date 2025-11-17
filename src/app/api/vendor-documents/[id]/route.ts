import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("API route called with params:", params);

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("User authentication check:", user?.id);

    if (!user) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a company contact
    const { data: companyContact, error: companyError } = await supabase
      .from("company_contacts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    console.log("Company contact check:", companyContact, companyError);

    if (companyError || !companyContact) {
      console.log("User is not a company contact");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the vendor ID from params
    const { id } = await params;
    console.log("Fetching documents for vendor ID:", id);

    // Fetch documents for the specified vendor
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("*")
      .eq("vendor_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    console.log("Documents query result:", documents, documentsError);

    if (documentsError) {
      console.error("Documents fetch error:", documentsError);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    // Return documents
    console.log("Returning documents:", documents?.length || 0);
    return NextResponse.json({ data: documents || [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
