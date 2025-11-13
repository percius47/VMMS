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

    // Fetch all company contacts (in a real app, you might want to add pagination and filters)
    const { data, error } = await supabase
      .from("company_contacts")
      .select("*")
      .eq("is_active", true);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch company contacts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const companyData = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a company contact profile
    const { data: existingCompany, error: existingCompanyError } =
      await supabase
        .from("company_contacts")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (existingCompany && !existingCompanyError) {
      return NextResponse.json(
        { error: "Company contact profile already exists" },
        { status: 400 }
      );
    }

    // Create new company contact
    const { data, error } = await supabase
      .from("company_contacts")
      .insert([
        {
          ...companyData,
          user_id: user.id,
          status: "pending_approval",
          is_active: true,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create company contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create company contact" },
      { status: 500 }
    );
  }
}
