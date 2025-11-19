import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: {
    host: "0.0.0.0",
  },
  stdio: true,
  paths: {
    tools: "./src/tools",
    prompts: false,
    resources: false,
  },
};

export default config;
