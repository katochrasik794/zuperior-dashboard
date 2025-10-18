// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { renderWelcomeEmail } from "@/utils/renderEmailTemplate";


export async function POST(request: NextRequest) {
  // Read raw text body (form-urlencoded string)
  const rawBody = await request.text();

  // Parse incoming form data
  const searchParams = new URLSearchParams(rawBody);

  // Now reconstruct the outgoing form data (make sure no typos)
  const outgoingForm = new URLSearchParams();

  outgoingForm.append("request", searchParams.get("request") || "");
  outgoingForm.append("access_token", searchParams.get("access_token") || "");
  outgoingForm.append("first_name", searchParams.get("first_name") || "");
  outgoingForm.append("last_name", searchParams.get("last_name") || "");
  outgoingForm.append("email", searchParams.get("email") || "");
  outgoingForm.append("phone", searchParams.get("phone") || "");
  outgoingForm.append("password", searchParams.get("password") || "");
  outgoingForm.append("country", searchParams.get("country") || "");
  outgoingForm.append("platform_name", searchParams.get("platform_name") || "");
  outgoingForm.append("account_type_requested", searchParams.get("account_type_requested") || "standard");
  outgoingForm.append("ip", searchParams.get("ip") || "");

  // Optional: Log outgoing form data to debug
  console.log("Outgoing form data:", outgoingForm.toString());

  // Check if any required field is missing
  for (const [key, value] of outgoingForm.entries()) {
    if (!value) {
      return NextResponse.json(
        { status: "Failed", message: `Missing field: ${key}` },
        { status: 400 }
      );
    }
  }

  // Send request to the real API
  const apiRes = await fetch("https://client.api.skaleapps.io/api/v-2/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: outgoingForm.toString(),
  });

  const data = await apiRes.json();

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Render the welcome email HTML
  const html = await renderWelcomeEmail();

  // Send the email
  transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: searchParams.get("email") || "", // <-- get email from form data, fallback to empty string
    subject: "Welcome to Zuperior!",
    html,
  });

  return NextResponse.json(data, { status: apiRes.status });
}
