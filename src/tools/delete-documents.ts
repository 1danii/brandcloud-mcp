import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
  domain: z.string().default(process.env.BRANDCLOUD_DOMAIN || "").describe("BrandCloud instance domain name"),
  documentIds: z.array(z.number()).describe("Array of document IDs to move to trash"),
};

export const metadata: ToolMetadata = {
  name: "delete-documents",
  description: "Move multiple documents to trash (soft delete). Documents can be restored later.",
  annotations: {
    title: "Delete BrandCloud Documents",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
  },
};

export default async function deleteDocuments({ 
  domain, 
  documentIds 
}: InferSchema<typeof schema>) {
  // Try to get API key from headers (HTTP mode) or environment variable (STDIO mode)
  let apiKey: string | undefined;
  try {
    const requestHeaders = headers();
    const headerValue = requestHeaders["x-brandcloud-api-key"];
    apiKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  } catch {
    // In STDIO mode, headers() throws an error, so we fall back to env var
    apiKey = process.env.BRANDCLOUD_API_KEY;
  }
  
  const baseUrl = `https://${domain}.brandcloud.pro/api/v2`;
  const params = new URLSearchParams();
  
  // Add API key as query parameter
  if (apiKey) params.append("apiKey", apiKey);
  
  const url = `${baseUrl}/document${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ ids: documentIds }),
  }).then(res => {
    if (res.status === 200) {
      return { success: true, message: "Documents moved to trash successfully" };
    }
    return res.json();
  });
  
  return JSON.stringify(response, null, 2);
}

