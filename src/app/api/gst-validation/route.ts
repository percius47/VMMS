import {  NextResponse } from "next/server";
import { type NextRequest } from "next/server";
// This API route validates GST number and fetches business details
export async function POST(request: NextRequest) {
  try {
    const { gstNumber } = await request.json();

    // Basic GST number format validation
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(gstNumber)) {
      return NextResponse.json(
        { error: "Invalid GST number format" },
        { status: 400 }
      );
    }

    // In a real implementation, you would call an external GST API here
    // For now, we'll return mock data with business details
    const businessDetails = {
      gstin: gstNumber,
      businessName: "ABC Company Private Limited",
      tradeName: "ABC Company",
      constitutionOfBusiness: "Private Limited Company",
      address: {
        building: "123",
        street: "MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
      },
      status: "Active",
      taxpayerType: "Regular",
      dateOfRegistration: "2020-01-15",
      dateOfCancellation: null,
      stateJurisdiction: "KARNATAKA - WEST",
      centerJurisdiction: "RANGE-BLN",
      businessActivities: [
        {
          principalBusinessActivity: "Manufacturing",
          dateOfCommencement: "2020-01-15",
        },
      ],
    };

    return NextResponse.json({ data: businessDetails });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to validate GST number and fetch business details" },
      { status: 500 }
    );
  }
}
