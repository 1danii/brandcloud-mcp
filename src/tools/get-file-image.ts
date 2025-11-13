import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

export const schema = {
  domain: z
    .string()
    .default(process.env.BRANDCLOUD_DOMAIN || "demo")
    .describe("BrandCloud instance domain name"),
  fileId: z.number().describe("The ID of the file to download"),
  size: z
    .enum(["original", "medium", "small"])
    .default("medium")
    .describe("Size variant to download (original, medium, or small)"),
  saveToWorkspace: z
    .boolean()
    .default(false)
    .describe("If true, saves to workspace downloads folder instead of temp directory"),
};

export const metadata: ToolMetadata = {
  name: "get-file-image",
  description:
    "Download and view an image file from BrandCloud. Returns the image directly as base64-encoded content for immediate viewing. Useful for viewing logos, photos, brand colors, typography examples, and other visual brand assets.",
  annotations: {
    title: "View BrandCloud Image",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getFileImage({
  domain,
  fileId,
  size,
  saveToWorkspace,
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

  // First get file metadata to determine filename and extension
  const baseUrl = `https://${domain}.brandcloud.pro/api/v2`;
  const metadataParams = new URLSearchParams();
  if (apiKey) metadataParams.append("apiKey", apiKey);
  
  const metadataUrl = `${baseUrl}/file/${fileId}${metadataParams.toString() ? `?${metadataParams.toString()}` : ''}`;
  
  const fileMetadata = await fetch(metadataUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  }).then((res) => res.json());

  // Construct download URL
  const downloadParams = new URLSearchParams();
  if (apiKey) downloadParams.append("apiKey", apiKey);
  if (size !== "original") downloadParams.append("size", size);
  
  const downloadUrl = `${baseUrl}/file/${fileId}/download${downloadParams.toString() ? `?${downloadParams.toString()}` : ''}`;

  // Download the file
  const response = await fetch(downloadUrl, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  // Get the file extension from metadata
  const ext = fileMetadata.ext || "jpg";
  const fileName = fileMetadata.name || `file-${fileId}.${ext}`;
  const safeFileName = fileName.replace(/[^a-z0-9.-]/gi, '_');

  // Determine save location
  let savePath: string;
  if (saveToWorkspace) {
    const workspaceDownloads = path.join(process.cwd(), "downloads");
    await fs.mkdir(workspaceDownloads, { recursive: true });
    savePath = path.join(workspaceDownloads, safeFileName);
  } else {
    const tempDir = os.tmpdir();
    const brandcloudTempDir = path.join(tempDir, "brandcloud-mcp-images");
    await fs.mkdir(brandcloudTempDir, { recursive: true });
    savePath = path.join(brandcloudTempDir, safeFileName);
  }

  // Save the file
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(savePath, buffer);

  // Convert buffer to base64 for image content
  const base64Data = buffer.toString('base64');
  
  // Determine MIME type
  const mimeType = `image/${ext}` || 'image/png';

  // Return image content directly in MCP format
  return {
    content: [
      {
        type: "image" as const,
        data: base64Data,
        mimeType: mimeType,
      },
      {
        type: "text" as const,
        text: JSON.stringify({
          fileId,
          fileName: fileName,
          savedAs: safeFileName,
          path: savePath,
          size: size,
          sizeBytes: buffer.length,
          type: fileMetadata.type,
          ext: ext,
          resolution: fileMetadata.resolution?.[size] || fileMetadata.resolution?.original,
          downloadUrl: downloadUrl,
          message: `Image retrieved successfully from BrandCloud`,
        }, null, 2)
      }
    ]
  };
}

