import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the vendor associated with this user
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get the document ID from params
    const { id } = await params;

    // Fetch the document to verify ownership
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("id, vendor_id, file_name")
      .eq("id", id)
      .eq("vendor_id", vendor.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the document from storage
    const { error: storageError } = await supabase.storage
      .from("vendor-documents")
      .remove([document.file_name]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      return NextResponse.json(
        { error: "Failed to delete document from storage" },
        { status: 500 }
      );
    }

    // Delete the document metadata from database
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Database delete error:", dbError);
      // If database delete fails, we should log this but still return success
      // since the file has been removed from storage
      return NextResponse.json(
        { error: "Failed to delete document metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
