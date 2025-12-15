import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

const ElementPageDataSchema = z.object({
  header: z.string().describe("Document header"),
  showStock: z.boolean().optional().describe("Show stock column"),
  eshop: z.boolean().optional().describe("Show eshop on page?"),
});

const ElementHeaderDataSchema = z.object({
  header: z.string().describe("Header text"),
});

const ElementTextDataSchema = z.object({
  html: z.string().describe("HTML content for the text block"),
});

const ElementColorDataSchema = z.object({
  name: z.string().describe("Color name"),
  text_color: z.string().optional().describe("Text color in HEX"),
  r: z.number().min(0).max(255).describe("Red value 0-255"),
  g: z.number().min(0).max(255).describe("Green value 0-255"),
  b: z.number().min(0).max(255).describe("Blue value 0-255"),
});

const ElementColorRowDataSchema = z.object({
  name: z.string().describe("Color row value title (e.g., 'RAL')"),
  value: z.string().describe("Color row value (e.g., 'RAL 1234')"),
});

const ElementEmbedDataSchema = z.object({
  url: z.string().describe("URL of embed (e.g., YouTube video)"),
  height: z.number().optional().describe("Height of embed in px"),
});

export const schema = {
  domain: z
    .string()
    .default(process.env.BRANDCLOUD_DOMAIN || "")
    .describe("BrandCloud instance domain name"),
  documentId: z.number().describe("Document ID"),
  revisionId: z.number().describe("Document revision ID"),
  elementId: z.number().describe("Element ID to update"),
  parentElementId: z
    .number()
    .optional()
    .describe("Parent element ID (for nested elements)"),
  rank: z.number().optional().describe("Display order of the element"),
  type: z
    .enum([
      "page",
      "header",
      "text",
      "color",
      "color-row",
      "embed",
    ])
    .describe("Type of element"),
  data: z
    .union([
      ElementPageDataSchema,
      ElementHeaderDataSchema,
      ElementTextDataSchema,
      ElementColorDataSchema,
      ElementColorRowDataSchema,
      ElementEmbedDataSchema,
    ])
    .describe("Element data based on type"),
};

export const metadata: ToolMetadata = {
  name: "update-element",
  description:
    "Update an existing element (page, header, text block, color block, embed, etc.) in a BrandCloud document.",
  annotations: {
    title: "Update Document Element",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function updateElement({
  domain,
  documentId,
  revisionId,
  elementId,
  parentElementId,
  rank,
  type,
  data,
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

  const body: Record<string, unknown> = {
    type,
    data,
  };

  if (rank !== undefined) body.rank = rank;
  if (parentElementId !== undefined) {
    body.parent__bc_document_data_rev_id = parentElementId;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  return JSON.stringify(response, null, 2);
}




