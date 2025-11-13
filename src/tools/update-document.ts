import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
  domain: z.string().default(process.env.BRANDCLOUD_DOMAIN || "").describe("BrandCloud instance domain name"),
  documentId: z.number().describe("The ID of the document to update"),
  name: z.string().optional().describe("New document name"),
  bcFolderId: z.number().optional().describe("Move to this folder ID"),
  rank: z.number().optional().describe("New display order"),
  allowComments: z.boolean().optional().describe("Allow comments on this document"),
  previewUrl: z.string().optional().describe("Preview image URL"),
  previewMetaData: z.string().optional().describe("Metadata JSON for preview"),
  imageFileId: z.number().optional().describe("File ID for document icon image"),
  iconText: z.string().optional().describe("Text over image/bg on document icon"),
  iconBgColor: z.string().optional().describe("Document icon background color"),
  iconTextColor: z.string().optional().describe("Document icon text color"),
};

export const metadata: ToolMetadata = {
  name: "update-document",
  description: "Update an existing document's properties like name, folder location, rank, or icon settings.",
  annotations: {
    title: "Update BrandCloud Document",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function updateDocument({ 
  domain, 
  documentId,
  name,
  bcFolderId,
  rank,
  allowComments,
  previewUrl,
  previewMetaData,
  imageFileId,
  iconText,
  iconBgColor,
  iconTextColor
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
  
  const body: Record<string, unknown> = {};
  
  if (name) body.name = name;
  if (bcFolderId) body.bc_folder_id = bcFolderId;
  if (rank !== undefined) body.rank = rank;
  if (allowComments !== undefined) body.allow_comments = allowComments;
  if (previewUrl) body.preview__url = previewUrl;
  if (previewMetaData) body.preview__meta_data = previewMetaData;
  if (imageFileId) body.image__file_id = imageFileId;
  if (iconText) body.icon_text = iconText;
  if (iconBgColor) body.icon_bg_color = iconBgColor;
  if (iconTextColor) body.icon_text_color = iconTextColor;
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  }).then(res => res.json());
  
  return JSON.stringify(response, null, 2);
}

