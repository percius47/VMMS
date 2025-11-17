import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { status } = await request.json();

    // Validate status value
    const validStatuses = ["active", "disabled", "blacklisted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status value. Must be one of: active, disabled, blacklisted",
        },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the id from the promise
    const { id } = await params;

    // Check if the user is a company contact
    const { data: companyContact, error: companyError } = await supabase
      .from("company_contacts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!companyContact || companyError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // First, check if the vendor exists
    const { data: vendorExists, error: vendorCheckError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", id)
      .single();

    if (vendorCheckError || !vendorExists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Update vendor status
    const { data, error } = await supabase
      .from("vendors")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error", error);
      return NextResponse.json(
        {
          error:
            "Failed to update vendor status: " +
            (error.message || error.toString()),
        },
        { status: 500 }
      );
    }

    // Check if any rows were affected
    if (data.length === 0) {
      return NextResponse.json(
        { error: "Vendor not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: data[0] });
  } catch (error: any) {
    console.error("Unexpected error", error);
    return NextResponse.json(
      {
        error:
          "Failed to update vendor status: " +
          (error.message || error.toString()),
      },
      { status: 500 }
    );
  }
}
