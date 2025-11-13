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

    // Get vendor statistics
    const { count: totalVendors, error: totalError } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true });

    const { count: approvedVendors, error: approvedError } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: pendingVendors, error: pendingError } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_approval");

    const { count: rejectedVendors, error: rejectedError } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    if (totalError || approvedError || pendingError || rejectedError) {
      return NextResponse.json(
        { error: "Failed to fetch vendor statistics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalVendors: totalVendors || 0,
      approvedVendors: approvedVendors || 0,
      pendingVendors: pendingVendors || 0,
      rejectedVendors: rejectedVendors || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vendor statistics" },
      { status: 500 }
    );
  }
}
