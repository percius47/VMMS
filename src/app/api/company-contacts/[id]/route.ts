import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the id from the promise
    const { id } = await params;

    // Fetch company contact by ID
    const { data, error } = await supabase
      .from("company_contacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Company contact not found" },
        { status: 404 }
      );
    }

    // Check if the company contact belongs to the current user or if user is admin
    if (data.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company contact" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const updates = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the id from the promise
    const { id } = await params;

    // Fetch company contact by ID to check ownership
    const { data: companyData, error: fetchError } = await supabase
      .from("company_contacts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Company contact not found" },
        { status: 404 }
      );
    }

    // Check if the company contact belongs to the current user
    if (companyData.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update company contact
    const { data, error } = await supabase
      .from("company_contacts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update company contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update company contact" },
      { status: 500 }
    );
  }
}
