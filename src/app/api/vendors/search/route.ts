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

    // Search vendors by company name or GST number
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .or(`company_name.ilike.%${query}%,gst_number.ilike.%${query}%`)
      .eq("is_active", true)
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Failed to search vendors" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search vendors" },
      { status: 500 }
    );
  }
}
