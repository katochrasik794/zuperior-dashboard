// Update KYC verification status
import axios from "axios";

interface UpdateKycResponse {
  status: string;       // e.g. "Success"
  status_code: string;  // e.g. "1"
}

export async function updateKycStatus(
  email: string,
  accessToken: string,
  verificationStatus: "Partially Verified" | "Verified"
): Promise<UpdateKycResponse | null> {
  try {
    const response = await axios.post<UpdateKycResponse>("/api/kyc", {
      email,
      accessToken,
      verificationStatus,
    });

    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating KYC status:", error?.response?.data || error.message);
    return null;
  }
}
