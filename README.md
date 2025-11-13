# BrandCloud MCP Server

An MCP (Model Context Protocol) server for managing documents, folders, and files in BrandCloud. This server provides AI assistants with tools to interact with the BrandCloud API using secure API key middleware authentication.

## Features

### Document Management Tools

- **list-documents** - List all documents with filtering options
- **get-document** - Get detailed document information with all elements
- **create-document** - Create new documents in folders
- **update-document** - Update document properties
- **delete-documents** - Move documents to trash

### Folder Management Tools

- **list-folders** - List folder hierarchy
- **create-folder** - Create new folders
- **update-folder** - Update folder properties
- **delete-folders** - Move folders to trash

### File Management Tools

- **list-files** - List files with search and sorting
- **get-file-detail** - Get detailed file information including usage

### Search Tools

- **search-brandcloud** - Search across all BrandCloud content

## Authentication

This server uses **API Key Middleware** authentication via the `x-brandcloud-api-key` header. The API key is validated automatically by the middleware before any tool is executed, eliminating the need to pass it as a parameter to each tool.

## Installation

1. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Build the project:**

```bash
npm run build
```

## Usage

### Running in Development Mode

```bash
npm run dev
```

### Running in Production

```bash
npm run start
```

This will start the HTTP server on the default port.

## Configuration

### For Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "brandcloud": {
      "command": "node",
      "args": ["/absolute/path/to/bc-mcp/dist/stdio.js"],
      "env": {
        "BRANDCLOUD_API_KEY": "your-api-key-here",
        "BRANDCLOUD_DOMAIN": "your-domain"
      }
    }
  }
}
```

**Note:** Claude Desktop can use either `stdio.js` or `http.js`. We recommend `stdio.js` for consistency with Cursor.

### For Cursor

Add this to your Cursor settings (`.cursor/mcp.json` in your project root, or through Settings > Features > MCP):

**Recommended Configuration (with environment variables):**

```json
{
  "mcpServers": {
    "brandcloud": {
      "command": "node",
      "args": ["/absolute/path/to/bc-mcp/dist/stdio.js"],
      "env": {
        "BRANDCLOUD_API_KEY": "your-api-key-here",
        "BRANDCLOUD_DOMAIN": "your-domain"
      }
    }
  }
}
```

**Important:** Replace the following in the configuration above:

- `/absolute/path/to/bc-mcp/dist/stdio.js` - Full path to your built stdio server (use `stdio.js` for Cursor, not `http.js`)
- `your-api-key-here` - Your actual BrandCloud API key
- `your-domain` - Your BrandCloud domain (e.g., "demo", "company")

**How It Works:**

1. The API key is passed as an environment variable (`BRANDCLOUD_API_KEY`)
2. The middleware validates it from either:
   - The `x-brandcloud-api-key` request header (if provided by the MCP client)
   - The `BRANDCLOUD_API_KEY` environment variable (as fallback)
3. Tools automatically access the API key using `headers()` or the environment variable

**Alternative: Using .env file (Development)**

If you prefer, you can also create a `.env` file in the `bc-mcp` directory:

```bash
BRANDCLOUD_API_KEY=your-api-key-here
BRANDCLOUD_DOMAIN=your-domain
```

Then use simpler MCP configuration:

```json
{
  "mcpServers": {
    "brandcloud": {
      "command": "node",
      "args": ["/absolute/path/to/bc-mcp/dist/stdio.js"]
    }
  }
}
```

Note: The `.env` file approach requires the server to load environment variables at startup.

**Why `stdio.js` for Cursor?**

Cursor uses the stdio (standard input/output) protocol for MCP communication, not HTTP. The build process creates two files:

- `dist/stdio.js` - For Cursor and other stdio-based MCP clients
- `dist/http.js` - For HTTP-based servers (Claude Desktop can use either)

## Quick Start

After completing the installation and configuration above, you can start using the tools immediately. Here are some example prompts to try:

### Try These Prompts

**List all documents:**

```
List all documents in my BrandCloud instance
```

**Create a document:**

```
Create a new document called "Q1 Brand Guidelines" in folder ID 5 with rank 1
```

**Search for content:**

```
Search for "logo" in BrandCloud
```

**Create a folder:**

```
Create a new folder called "2024 Marketing" as a subfolder of folder ID 1
```

**Get document details:**

```
Show me the details of document 123
```

**Note:** You don't need to pass the API key in any prompts - it's handled automatically by the middleware!

## Getting Your API Key

To use the BrandCloud API, you'll need an API key:

1. Log in to your BrandCloud instance
2. Go to your account settings
3. Navigate to API settings
4. Generate or copy your API key
5. The API key will be sent automatically in request headers by the MCP client

## How Middleware Authentication Works

This server uses a modern middleware approach for API key authentication, following industry best practices.

### Why Middleware?

**Traditional Approach (❌ Not Used):**

```typescript
// You would have to pass apiKey every time
list -
  documents({
    apiKey: "your-key",
    domain: "your-domain",
  });
```

**Middleware Approach (✅ What We Use):**

```typescript
// API key is automatically extracted from headers/env
list -
  documents({
    domain: "your-domain",
  });
```

**Benefits:**

- ✅ Cleaner tool calls
- ✅ More secure (keys in headers/env, not parameters)
- ✅ Single configuration point
- ✅ Easier to rotate API keys
- ✅ Follows industry best practices

### How It Works

The server uses xmcp's built-in `apiKeyAuthMiddleware` to validate API keys:

```typescript
// src/middleware.ts
import { apiKeyAuthMiddleware, type Middleware } from "xmcp";

const middleware: Middleware = apiKeyAuthMiddleware({
  headerName: "x-brandcloud-api-key",
  validateApiKey: async (apiKey) => {
    if (!apiKey || apiKey.trim() === "") {
      return false;
    }
    return true;
  },
});
```

### Tool Implementation

Each tool accesses the API key from headers:

```typescript
import { headers } from "xmcp/headers";

export default async function myTool({ domain }: InferSchema<typeof schema>) {
  const requestHeaders = headers();
  const apiKey = requestHeaders["x-brandcloud-api-key"];

  // Use apiKey to make API calls
  const response = await fetch(url, {
    /* ... */
  });
  return response;
}
```

## Detailed Usage Examples

Once configured, you can ask your AI assistant to interact with BrandCloud. Here are comprehensive examples:

### Document Management Examples

#### Example 1: List All Documents

**Prompt:**

```
List all documents in my BrandCloud
```

**Tool Call:**

```typescript
list -
  documents({
    domain: "your-domain",
  });
```

**Response:** Array of document objects with metadata

#### Example 2: List Documents in a Folder

**Prompt:**

```
Show me all documents in folder 5
```

**Tool Call:**

```typescript
list -
  documents({
    domain: "your-domain",
    rootId: 5,
  });
```

#### Example 3: Filter Documents by File Type

**Prompt:**

```
Show me all documents that contain PDF or PNG files
```

**Tool Call:**

```typescript
list -
  documents({
    domain: "your-domain",
    containsFileExts: ["pdf", "png"],
  });
```

#### Example 4: Create a Document

**Prompt:**

```
Create a new document called "Q1 Brand Guidelines" in folder 5
```

**Tool Call:**

```typescript
create -
  document({
    domain: "your-domain",
    name: "Q1 Brand Guidelines",
    bcFolderId: 5,
    rank: 1,
  });
```

#### Example 5: Update a Document

**Prompt:**

```
Rename document 123 to "Q2 Brand Guidelines"
```

**Tool Call:**

```typescript
update -
  document({
    domain: "your-domain",
    documentId: 123,
    name: "Q2 Brand Guidelines",
  });
```

#### Example 6: Delete Documents

**Prompt:**

```
Move documents 123, 124, and 125 to trash
```

**Tool Call:**

```typescript
delete -documents({
  domain: "your-domain",
  ids: [123, 124, 125],
});
```

### Folder Management Examples

#### Example 7: List All Folders

**Prompt:**

```
Show me all folders in BrandCloud
```

**Tool Call:**

```typescript
list -
  folders({
    domain: "your-domain",
  });
```

#### Example 8: Create a Folder

**Prompt:**

```
Create a new folder called "2024 Marketing" in folder 1
```

**Tool Call:**

```typescript
create -
  folder({
    domain: "your-domain",
    name: "2024 Marketing",
    parentBcFolderId: 1,
    rank: 1,
  });
```

#### Example 9: Update a Folder

**Prompt:**

```
Rename folder 10 to "2024 Marketing Materials"
```

**Tool Call:**

```typescript
update -
  folder({
    domain: "your-domain",
    folderId: 10,
    name: "2024 Marketing Materials",
  });
```

### File Management Examples

#### Example 10: List Files

**Prompt:**

```
Show me the first 50 files sorted by name
```

**Tool Call:**

```typescript
list -
  files({
    domain: "your-domain",
    limit: 50,
    order: "name",
    dir: "asc",
  });
```

#### Example 11: Get File Details

**Prompt:**

```
Show me details about file 456
```

**Tool Call:**

```typescript
get -
  file -
  detail({
    domain: "your-domain",
    fileId: 456,
  });
```

### Search Examples

#### Example 12: Search for Content

**Prompt:**

```
Search for all content containing "logo"
```

**Tool Call:**

```typescript
search -
  brandcloud({
    domain: "your-domain",
    query: "logo",
  });
```

#### Example 13: Search Files Only

**Prompt:**

```
Search for files named "logo"
```

**Tool Call:**

```typescript
search -
  brandcloud({
    domain: "your-domain",
    query: "logo",
    searchType: "file",
  });
```

#### Example 14: Search Documents Only

**Prompt:**

```
Search for documents about "branding"
```

**Tool Call:**

```typescript
search -
  brandcloud({
    domain: "your-domain",
    query: "branding",
    searchType: "document",
  });
```

## Tool Parameters

### Common Parameters

All tools require:

- **domain** (string, default: "demo") - Your BrandCloud instance domain name

The API key is handled automatically by the middleware.

### Document Tools

#### list-documents

- `rootId` (number, optional) - List documents from this folder
- `bcId` (number, optional) - Filter by BrandCloud domain ID
- `containsElements` (string[], optional) - Filter by element types
- `containsFileExts` (string[], optional) - Filter by file extensions

#### create-document / update-document

- `name` (string) - Document name
- `bcFolderId` (number) - Parent folder ID
- `rank` (number) - Display order
- `allowComments` (boolean, optional) - Enable comments
- `imageFileId` (number, optional) - Icon image file ID
- `iconText` (string, optional) - Icon text overlay
- `iconBgColor` (string, optional) - Icon background color
- `iconTextColor` (string, optional) - Icon text color

### Folder Tools

#### list-folders

- `rootId` (number, optional) - List from this parent folder
- `bcId` (number, optional) - Filter by domain ID

#### create-folder / update-folder

- `name` (string) - Folder name
- `parentBcFolderId` (number) - Parent folder ID
- `rank` (number) - Display order
- `link` (string, optional) - External link URL
- `imageFileId` (number, optional) - Icon image
- `headerFileId` (number, optional) - Header image
- `iconText` (string, optional) - Icon text overlay
- `iconBgColor` (string, optional) - Icon background color
- `iconTextColor` (string, optional) - Icon text color

### File Tools

#### list-files

- `query` (string, optional) - Search text
- `limit` (number, default: 100) - Items to return
- `offset` (number, default: 0) - Items to skip
- `order` (enum: "uploaded" | "name" | "size") - Sort by
- `dir` (enum: "asc" | "desc") - Sort direction

## API Endpoints

The server connects to BrandCloud API at:

```
https://{domain}.beta.brandcloud.pro/api/v2
```

Default domain is "demo". Replace with your actual domain.

## Development

### Project Structure

```
bc-mcp/
├── src/
│   ├── middleware.ts    # API key authentication middleware
│   ├── tools/           # Tool definitions
│   │   ├── list-documents.ts
│   │   ├── get-document.ts
│   │   ├── create-document.ts
│   │   ├── update-document.ts
│   │   ├── delete-documents.ts
│   │   ├── list-folders.ts
│   │   ├── create-folder.ts
│   │   ├── update-folder.ts
│   │   ├── delete-folders.ts
│   │   ├── list-files.ts
│   │   ├── get-file-detail.ts
│   │   └── search-brandcloud.ts
│   ├── prompts/         # Prompt templates (optional)
│   └── resources/       # Resource handlers (optional)
├── dist/                # Compiled output
│   ├── stdio.js         # Stdio server (for Cursor)
│   ├── http.js          # HTTP server (for standalone use)
│   └── ...
├── package.json
├── tsconfig.json
└── xmcp.config.ts      # XMCP configuration
```

### Adding New Tools

1. Create a new `.ts` file in `src/tools/`
2. Define the schema using Zod (no need for apiKey parameter)
3. Export metadata with tool information
4. Export default function with implementation
5. Use `headers()` from `xmcp/headers` to access the API key

Example:

```typescript
import { z } from "zod";
import { type InferSchema, type ToolMetadata } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
  domain: z.string().default("demo").describe("Domain name"),
  // ... other parameters
};

export const metadata: ToolMetadata = {
  name: "my-tool",
  description: "Tool description",
  annotations: {
    title: "My Tool",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function myTool({ domain }: InferSchema<typeof schema>) {
  const requestHeaders = headers();
  const apiKey = requestHeaders["x-brandcloud-api-key"];

  // Implementation
  const response = await fetch(/* ... */);
  return JSON.stringify(response, null, 2);
}
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **API keys are validated by middleware** - All requests must include a valid API key in the `x-brandcloud-api-key` header
2. **Store API keys securely** in environment variables or the MCP client configuration
3. **Use HTTPS** for all API communications (already enforced)
4. **Validate inputs** before making API calls
5. **Handle errors** gracefully and don't expose sensitive information
6. **Never commit API keys** to version control

## Troubleshooting

### "MCP server not found"

**Problem:** The AI assistant can't find the BrandCloud MCP server

**Solutions:**

- Make sure you built the project: `npm run build`
- Check that the path in your config is absolute (full path, not relative)
- Verify the `dist/stdio.js` file exists (this is created when you run `npm run build`)
- For Cursor: Use `stdio.js`, not `http.js`
- Restart your AI assistant (Cursor or Claude Desktop)

### "Authentication failed" / 401 Unauthorized

**Problem:** API key validation is failing

**Solutions:**

- Verify your API key is correct and active in your BrandCloud account
- Check that the API key is properly set in the `env` configuration section
- Ensure `BRANDCLOUD_API_KEY` is spelled correctly in your config
- Check the server logs for detailed error messages
- Verify the middleware file (`src/middleware.ts`) exists and is built

### "Connection refused" / Server not starting

**Problem:** The MCP server isn't running or can't bind to the port

**Solutions:**

- Check for port conflicts (default is 3000)
- Try a different port in the config: `"PORT": "3001"`
- For Claude Desktop, the server starts automatically when Claude launches
- For Cursor, make sure the build is up to date
- Check if another process is using the port: `lsof -i :3000` (macOS/Linux)

### Tools require "apiKey" parameter

**Problem:** The middleware isn't loading properly

**Solutions:**

- This means the middleware authentication isn't working
- Check that `src/middleware.ts` exists and is properly configured
- Rebuild the project: `npm run build`
- Restart your AI assistant after rebuilding
- Verify the xmcp.config.ts doesn't have any errors

### API calls failing with "domain not found"

**Problem:** The BrandCloud domain doesn't exist or is incorrect

**Solutions:**

- Verify your domain name is correct (e.g., "demo", "company")
- Check that your BrandCloud instance is accessible
- Try accessing `https://your-domain.beta.brandcloud.pro` in a browser
- Ensure you're using the correct base URL format

### Tools not appearing in AI assistant

**Problem:** The tools aren't showing up in Claude or Cursor

**Solutions:**

- Restart the AI application after any configuration changes
- Verify the path to `dist/stdio.js` is absolute and correct
- Check the MCP server logs for errors during startup
- Make sure all tools in `src/tools/` are properly exported
- Try running `npm run dev` to see if there are any compilation errors
- For Cursor: Check the MCP logs in the Output panel (View > Output > select "MCP")

### Slow response times

**Problem:** Tools are taking a long time to respond

**Solutions:**

- Check your network connection to BrandCloud
- Verify the BrandCloud API is responding quickly (test with curl or Postman)
- Consider using pagination for large result sets
- Check if your API key has rate limits applied

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

Proprietary - See BrandCloud terms of service at https://brandcloud.pro/terms/

## Support

For BrandCloud API documentation, visit: https://brandcloud.pro

For MCP-related issues, see: https://xmcp.dev/docs

## Changelog

### Version 0.1.0

- Initial release
- API key middleware authentication
- Document management tools
- Folder management tools
- File management tools
- Search functionality
