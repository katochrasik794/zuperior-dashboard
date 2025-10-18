// app/api/kyc/document/route.ts
import { DocumentKYCRequestBody, DocumentKYCResponse } from "@/types/kyc";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      SHUFTI_PRO_CLIENT_ID,
      SHUFTI_PRO_SECRET_KEY,
      SHUFTI_PRO_CALLBACK_URL,
    } = process.env;

    if (!SHUFTI_PRO_CLIENT_ID || !SHUFTI_PRO_SECRET_KEY || !SHUFTI_PRO_CALLBACK_URL) {
      throw new Error("Shufti Pro environment variables not configured");
    }

    const body: DocumentKYCRequestBody = await request.json();

    if (!body.reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    if (!body.document?.proof) {
      return NextResponse.json(
        { error: "Missing document proof" },
        { status: 400 }
      );
    }

    // Build Authorization header for Basic Auth
    const authHeader = Buffer.from(
      `${SHUFTI_PRO_CLIENT_ID}:${SHUFTI_PRO_SECRET_KEY}`
    ).toString("base64");

    // Build payload for OSR Offsite with OCR
    const payload = {
      reference: body.reference,
      callback_url: SHUFTI_PRO_CALLBACK_URL,
      document: {
        proof: body.document.proof,
        //additional_proof: body.document.additional_proof || undefined,
        supported_types: ["id_card", "passport", "driving_license"],
        fetch_enhanced_data: "1",
        verification_mode: "image_only",
        name: body.document.name,
      },
    };

    const response = await axios.post("https://api.shuftipro.com/", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
    });

    const data: DocumentKYCResponse = await response.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("KYC verification error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
