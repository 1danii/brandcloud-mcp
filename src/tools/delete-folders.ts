import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
  domain: z.string().default(process.env.BRANDCLOUD_DOMAIN || "").describe("BrandCloud instance domain name"),
  folderIds: z.array(z.number()).describe("Array of folder IDs to move to trash"),
};

export const metadata: ToolMetadata = {
  name: "delete-folders",
  description: "Move multiple folders to trash (soft delete). Folders and their contents can be restored later.",
  annotations: {
    title: "Delete BrandCloud Folders",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
  },
};

export default async function deleteFolders({ 
  domain, 
  folderIds 
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
  
  const url = `${baseUrl}/folder${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ ids: folderIds }),
  }).then(res => {
    if (res.status === 200) {
      return { success: true, message: "Folders moved to trash successfully" };
    }
    return res.json();
  });
  
  return JSON.stringify(response, null, 2);
}

