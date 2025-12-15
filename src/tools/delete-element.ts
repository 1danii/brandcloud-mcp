import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  domain: z
    .string()
    .default(process.env.BRANDCLOUD_DOMAIN || "")
    .describe("BrandCloud instance domain name"),
  documentId: z.number().describe("Document ID"),
  revisionId: z.number().describe("Document revision ID"),
  elementId: z.number().describe("Element ID to delete"),
};

export const metadata: ToolMetadata = {
  name: "delete-element",
  description:
    "Delete an element from a BrandCloud document revision.",
  annotations: {
    title: "Delete Document Element",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
  },
};

export default async function deleteElement({
  domain,
  documentId,
  revisionId,
  elementId,
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

  const url = `${baseUrl}/document/${documentId}/revision/${revisionId}/element/${elementId}${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  }).then((res) => res.json());

  return JSON.stringify(response, null, 2);
}




