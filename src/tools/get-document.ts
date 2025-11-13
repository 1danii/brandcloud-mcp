import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
  domain: z.string().default(process.env.BRANDCLOUD_DOMAIN || "").describe("BrandCloud instance domain name"),
  documentId: z.number().describe("The ID of the document to retrieve"),
};

export const metadata: ToolMetadata = {
  name: "get-document",
  description: "Get detailed information about a specific document including all its elements, pages, and content.",
  annotations: {
    title: "Get BrandCloud Document Details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getDocument({ 
  domain, 
  documentId 
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
  
  const url = `${baseUrl}/document/${documentId}${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  }).then(res => res.json());
  
  return JSON.stringify(response, null, 2);
}

