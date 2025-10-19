import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Get the backend URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);

  const request = params.get("request");
  const crm_account_id = params.get("crm_account_id");
  const platform_name = params.get("platform_name");
  const currency = params.get("currency");
  const password = params.get("password");
  const account_type_requested = params.get("account_type_requested");
  const leverage = params.get("requested_leverage");
  const nickname = params.get("nickname");

  if (!request || !crm_account_id || !platform_name || !currency || !password || !account_type_requested || !leverage || !nickname) {
    return NextResponse.json(
      { message: "Missing required fields." },
      { status: 400 }
    );
  }

  try {
    // Map account types to MT5 groups
    const accountTypeMapping: { [key: string]: string } = {
      'pro': 'real\\Bbook\\Pro\\dynamic-2000x-10P',
      'standard': 'real\\Bbook\\Standard\\dynamic-2000x-20Pips'
    };

    const mt5Group = accountTypeMapping[account_type_requested.toLowerCase()];

    if (!mt5Group) {
      return NextResponse.json(
        { message: "Invalid account type requested." },
        { status: 400 }
      );
    }

    // Prepare MT5 account creation data
    const mt5AccountData = {
      name: nickname,
      group: mt5Group,
      leverage: parseInt(leverage),
      masterPassword: password,
      investorPassword: password, // Using same password for both
      email: params.get("email") || `user${crm_account_id}@example.com`,
      country: params.get("country") || "US",
      city: params.get("city") || "New York",
      phone: params.get("phone") || "+1234567890",
      comment: `Created via CRM for account ${crm_account_id}`
    };

    console.log('🚀 Creating MT5 Account with data:', {
      ...mt5AccountData,
      masterPassword: '***',
      investorPassword: '***'
    });

    // Call the MT5 API to create the account
    const response = await axios.post(
      `${API_URL}/api/Users`,
      mt5AccountData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log('✅ MT5 Account created successfully:', response.data);

    return NextResponse.json({
      success: true,
      message: "MT5 account created successfully",
      data: response.data
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "MT5 API AxiosError:",
        error.response?.data || error.message
      );
      return NextResponse.json(
        {
          message: "Failed to create MT5 account",
          error: error.response?.data || error.message,
        },
        { status: error.response?.status || 500 }
      );
    } else if (error instanceof Error) {
      console.error("MT5 API Error:", error.message);
      return NextResponse.json(
        {
          message: "Unexpected error occurred while creating MT5 account",
          error: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error("Unknown error during MT5 account creation");
      return NextResponse.json(
        {
          message: "Unknown error occurred during MT5 account creation",
        },
        { status: 500 }
      );
    }
  }
}
