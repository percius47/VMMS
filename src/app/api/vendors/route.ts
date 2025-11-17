import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all vendors (in a real app, you might want to add pagination and filters)
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("is_active", true);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch vendors" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const vendorData = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a vendor profile
    const { data: existingVendor, error: existingVendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingVendor && !existingVendorError) {
      return NextResponse.json(
        { error: "Vendor profile already exists" },
        { status: 400 }
      );
    }

    // Create new vendor
    const { data, error } = await supabase
      .from("vendors")
      .insert([
        {
          ...vendorData,
          user_id: user.id,
          status: "active",
          is_active: true,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create vendor" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
