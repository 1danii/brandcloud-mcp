# BrandCloud MCP Server

An MCP (Model Context Protocol) server for managing documents, folders, and files in BrandCloud. This server provides AI assistants with tools to interact with the BrandCloud API using secure API key middleware authentication.

## Features

### Document Management Tools

- **list-documents** - List all documents with filtering options
- **get-document** - Get detailed document information with all elements
- **create-document** - Create new documents in folders
- **update-document** - Update document properties
- **delete-documents** - Move documents to trash

### Document Element Tools

- **create-element** - Add elements to documents (text blocks, headers, color blocks, embeds, etc.)
- **update-element** - Update existing document elements
- **delete-element** - Remove elements from documents
- **publish-document-revision** - Publish document changes to make them visible

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

**Add content to a document:**

```
Add a text block with "Welcome to our brand guidelines" and a color block with name "Primary Blue" RGB(0,102,204) to document 382989
```

**Create a complete document with content:**

```
Create a new document called "Brand Colors" in folder 174622, then add a header "Our Color Palette" and three color blocks: Primary Blue (0,102,204), Secondary Green (34,139,34), and Accent Orange (255,140,0)
```

**Note:** You don't need to pass the API key in any prompts - it's handled automatically by the middleware!
