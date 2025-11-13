import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  domain: z
    .string()
    .default(process.env.BRANDCLOUD_DOMAIN || "")
    .describe("BrandCloud instance domain name"),
  rootId: z.number().optional().describe("List documents from this folder ID"),
  bcId: z.number().optional().describe("BrandCloud domain ID to filter by"),
  containsElements: z
    .array(z.string())
    .optional()
    .describe("Filter documents containing these elements"),
  containsFileExts: z
    .array(z.string())
    .optional()
    .describe("Filter documents containing these file extensions"),
};

export const metadata: ToolMetadata = {
  name: "list-documents",
  description:
    "List documents in BrandCloud. Returns all documents or filtered by folder, domain, elements, or file extensions.",
  annotations: {
    title: "List BrandCloud Documents",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function listDocuments({
  domain,
  rootId,
  bcId,
  containsElements,
  containsFileExts,
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
  if (containsElements)
    containsElements.forEach((el) => params.append("containsElements", el));
  if (containsFileExts)
    containsFileExts.forEach((ext) => params.append("containsFileExts", ext));

  const url = `${baseUrl}/document${
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
