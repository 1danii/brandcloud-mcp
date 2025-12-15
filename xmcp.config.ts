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
        authorizationUrl: "https://authorization-server.com/authorize",
        tokenUrl: "https://authorization-server.com/token",
        registerUrl:
          "https://www.oauth.com/playground/client-registration.html", // mandatory
      },
      issuerUrl: "https://my-app.com",
      defaultScopes: ["openid", "profile", "email"],
      pathPrefix: "/oauth2",
    },
  },
};

export default config;
