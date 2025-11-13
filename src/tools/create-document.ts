import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";

export const schema = {
  domain: z
    .string()
    .default(process.env.BRANDCLOUD_DOMAIN || "")
    .describe("BrandCloud instance domain name"),
  name: z.string().describe("Document name (same as page 1 header)"),
  bcFolderId: z
    .number()
    .describe("Folder ID where the document will be created"),
  rank: z.number().default(1).describe("Display order of the document"),
  allowComments: z
    .boolean()
    .optional()
    .describe("Allow comments on this document"),
  previewUrl: z.string().optional().describe("Preview image URL"),
  previewMetaData: z.string().optional().describe("Metadata JSON for preview"),
  imageFileId: z
    .number()
    .optional()
    .describe("File ID for document icon image"),
  filesIds: z
    .array(z.number())
    .optional()
    .describe("File IDs to create document with"),
  iconText: z
    .string()
    .optional()
    .describe("Text over image/bg on document icon"),
  iconBgColor: z.string().optional().describe("Document icon background color"),
  iconTextColor: z.string().optional().describe("Document icon text color"),
};

export const metadata: ToolMetadata = {
  name: "create-document",
  description: "Create a new document in BrandCloud within a specified folder.",
  annotations: {
    title: "Create BrandCloud Document",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

export default async function createDocument({
  domain,
  name,
  bcFolderId,
  rank,
  allowComments,
  previewUrl,
  previewMetaData,
  imageFileId,
  filesIds,
  iconText,
  iconBgColor,
  iconTextColor,
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

  const body: Record<string, unknown> = {
    name,
    bc_folder_id: bcFolderId,
    rank,
  };

  if (allowComments !== undefined) body.allow_comments = allowComments;
  if (previewUrl) body.preview__url = previewUrl;
  if (previewMetaData) body.preview__meta_data = previewMetaData;
  if (imageFileId) body.image__file_id = imageFileId;
  if (filesIds) body.files_ids = filesIds;
  if (iconText) body.icon_text = iconText;
  if (iconBgColor) body.icon_bg_color = iconBgColor;
  if (iconTextColor) body.icon_text_color = iconTextColor;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  return JSON.stringify(response, null, 2);
}
