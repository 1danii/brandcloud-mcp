import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  domain: z
    .string()
    .default(process.env.BRANDCLOUD_DOMAIN || "")
    .describe("BrandCloud instance domain name"),
  query: z.string().optional().describe("Search text in files"),
  limit: z.number().default(100).describe("Number of items to return"),
  offset: z.number().default(0).describe("Number of items to skip"),
  order: z
    .enum(["uploaded", "name", "size"])
    .default("uploaded")
    .describe("Order by column"),
  dir: z.enum(["asc", "desc"]).default("desc").describe("Order direction"),
};

export const metadata: ToolMetadata = {
  name: "list-files",
  description:
    "List files in BrandCloud storage with optional search and sorting. Returns file metadata including size, type, and upload date.",
  annotations: {
    title: "List BrandCloud Files",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function listFiles({
  domain,
  query,
  limit,
  offset,
  order,
  dir,
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

  if (query) params.append("q", query);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  params.append("order", order);
  params.append("dir", dir);

  const url = `${baseUrl}/file?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  }).then((res) => res.json());

  return JSON.stringify(response, null, 2);
}
