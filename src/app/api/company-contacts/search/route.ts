import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!query) {
      return NextResponse.json({ data: [] });
    }

    // Search company contacts by name or company name
    const { data, error } = await supabase
      .from("company_contacts")
      .select("*")
      .or(`name.ilike.%${query}%,company_name.ilike.%${query}%`)
      .eq("is_active", true)
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Failed to search company contacts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search company contacts" },
      { status: 500 }
    );
  }
}
