import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
  domain: z.string().default(process.env.BRANDCLOUD_DOMAIN || "").describe("BrandCloud instance domain name"),
  name: z.string().describe("Folder name"),
  parentBcFolderId: z.number().describe("Parent folder ID"),
  rank: z.number().default(1).describe("Display order of the folder"),
  link: z.string().optional().describe("External link URL for the folder"),
  previewUrl: z.string().optional().describe("Preview image URL"),
  previewMetaData: z.string().optional().describe("Metadata JSON for preview"),
  imageFileId: z.number().optional().describe("File ID for folder icon image"),
  headerFileId: z.number().optional().describe("File ID for folder header image"),
  iconText: z.string().optional().describe("Text over image/bg on folder icon"),
  iconBgColor: z.string().optional().describe("Folder icon background color"),
  iconTextColor: z.string().optional().describe("Folder icon text color"),
};

export const metadata: ToolMetadata = {
  name: "create-folder",
  description: "Create a new folder in BrandCloud within a specified parent folder.",
  annotations: {
    title: "Create BrandCloud Folder",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

export default async function createFolder({ 
  domain, 
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
  
  const url = `${baseUrl}/folder${params.toString() ? `?${params.toString()}` : ''}`;
  
  const body: Record<string, unknown> = {
    name,
    parent__bc_folder_id: parentBcFolderId,
    rank,
  };
  
  if (link) body.link = link;
  if (previewUrl) body.preview__url = previewUrl;
  if (previewMetaData) body.preview__meta_data = previewMetaData;
  if (imageFileId) body.image__file_id = imageFileId;
  if (headerFileId) body.header__file_id = headerFileId;
  if (iconText) body.icon_text = iconText;
  if (iconBgColor) body.icon_bg_color = iconBgColor;
  if (iconTextColor) body.icon_text_color = iconTextColor;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  }).then(res => res.json());
  
  return JSON.stringify(response, null, 2);
}

