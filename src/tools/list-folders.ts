import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  domain: z
    .string()
    .default(process.env.BRANDCLOUD_DOMAIN || "")
    .describe("BrandCloud instance domain name"),
  rootId: z
    .number()
    .optional()
    .describe("List folders from this parent folder ID"),
  bcId: z.number().optional().describe("BrandCloud domain ID to filter by"),
};

export const metadata: ToolMetadata = {
  name: "list-folders",
  description:
    "List folders recursively from a given parent folder or from root. Returns the folder tree structure.",
  annotations: {
    title: "List BrandCloud Folders",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function listFolders({
  domain,
  rootId,
  bcId,
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

  if (rootId !== undefined) params.append("rootId", rootId.toString());
  if (bcId !== undefined) params.append("bcId", bcId.toString());

  const url = `${baseUrl}/folder${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  }).then((res) => res.json());

  return JSON.stringify(response, null, 2);
}
