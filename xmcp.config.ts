import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: {
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
  },
  stdio: true,
  paths: {
    tools: "./src/tools",
    prompts: false,
    resources: false,
  },
  experimental: {
    oauth: {
      baseUrl: "https://my-app.com",
      endpoints: {
        authorizationUrl: "https://auth-provider.com/oauth/authorize",
        tokenUrl: "https://auth-provider.com/oauth/token",
        registerUrl: "https://auth-provider.com/oauth/register", // mandatory
      },
      issuerUrl: "https://my-app.com",
      defaultScopes: ["openid", "profile", "email"],
      pathPrefix: "/oauth2",
    },
  },
};

export default config;
