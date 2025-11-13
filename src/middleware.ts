import { type Middleware } from "xmcp";

// Note: In STDIO mode (used by Cursor), middleware authentication doesn't work.
// Authentication is handled directly in tools via environment variables.
// This middleware only applies in HTTP mode.
const middleware: Middleware = async (req, res, next) => {
  // In STDIO mode, this middleware is bypassed
  // Tools access BRANDCLOUD_API_KEY directly from process.env
  return next();
};

export default middleware;
