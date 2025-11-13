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

    // Get company contact statistics
    const { count: totalContacts, error: totalError } = await supabase
      .from("company_contacts")
      .select("*", { count: "exact", head: true });

    const { count: approvedContacts, error: approvedError } = await supabase
      .from("company_contacts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: pendingContacts, error: pendingError } = await supabase
      .from("company_contacts")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_approval");

    const { count: rejectedContacts, error: rejectedError } = await supabase
      .from("company_contacts")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    if (totalError || approvedError || pendingError || rejectedError) {
      return NextResponse.json(
        { error: "Failed to fetch company contact statistics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalContacts: totalContacts || 0,
      approvedContacts: approvedContacts || 0,
      pendingContacts: pendingContacts || 0,
      rejectedContacts: rejectedContacts || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company contact statistics" },
      { status: 500 }
    );
  }
}
