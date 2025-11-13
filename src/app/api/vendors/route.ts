import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // For now, we'll just return a simple response
    // In a real application, this would fetch vendors from the database
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This is a placeholder for actual vendor data
    const vendors = [
      { id: 1, name: "Vendor A", category: "IT Services", status: "Active" },
      { id: 2, name: "Vendor B", category: "Consulting", status: "Pending" },
      { id: 3, name: "Vendor C", category: "Hardware", status: "Active" },
    ];

    return NextResponse.json({ vendors });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
