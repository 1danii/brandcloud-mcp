import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
  domain: z.string().default(process.env.BRANDCLOUD_DOMAIN || "").describe("BrandCloud instance domain name"),
  folderId: z.number().describe("The ID of the folder to update"),
  name: z.string().optional().describe("New folder name"),
  parentBcFolderId: z.number().optional().describe("Move to this parent folder ID"),
  rank: z.number().optional().describe("New display order"),
  link: z.string().optional().describe("External link URL"),
  previewUrl: z.string().optional().describe("Preview image URL"),
  previewMetaData: z.string().optional().describe("Metadata JSON for preview"),
  imageFileId: z.number().optional().describe("File ID for folder icon image"),
  headerFileId: z.number().optional().describe("File ID for folder header image"),
  iconText: z.string().optional().describe("Text over image/bg on folder icon"),
  iconBgColor: z.string().optional().describe("Folder icon background color"),
  iconTextColor: z.string().optional().describe("Folder icon text color"),
};

export const metadata: ToolMetadata = {
  name: "update-folder",
  description: "Update an existing folder's properties like name, parent folder, rank, or icon settings.",
  annotations: {
    title: "Update BrandCloud Folder",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function updateFolder({ 
  domain, 
  folderId,
  name,
  parentBcFolderId,
  rank,
  link,
  previewUrl,
  previewMetaData,
  imageFileId,
  headerFileId,
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
  
  const url = `${baseUrl}/folder/${folderId}${params.toString() ? `?${params.toString()}` : ''}`;
  
  const body: Record<string, unknown> = {};
  
  if (name) body.name = name;
  if (parentBcFolderId) body.parent__bc_folder_id = parentBcFolderId;
  if (rank !== undefined) body.rank = rank;
  if (link) body.link = link;
  if (previewUrl) body.preview__url = previewUrl;
  if (previewMetaData) body.preview__meta_data = previewMetaData;
  if (imageFileId) body.image__file_id = imageFileId;
  if (headerFileId) body.header__file_id = headerFileId;
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

