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

    const { count: activeVendors, error: activeError } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: disabledVendors, error: disabledError } = await supabase
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("status", "disabled");

    const { count: blacklistedVendors, error: blacklistedError } =
      await supabase
        .from("vendors")
        .select("*", { count: "exact", head: true })
        .eq("status", "blacklisted");

    if (totalError || activeError || disabledError || blacklistedError) {
      return NextResponse.json(
        { error: "Failed to fetch vendor statistics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalVendors: totalVendors || 0,
      activeVendors: activeVendors || 0,
      disabledVendors: disabledVendors || 0,
      blacklistedVendors: blacklistedVendors || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vendor statistics" },
      { status: 500 }
    );
  }
}
