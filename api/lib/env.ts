import "dotenv/config";

// Optional platform capabilities must not prevent the web server from booting.
// Features that actually need credentials validate them at their point of use.
export const env = {
  appId: process.env.APP_ID ?? "",
  appSecret: process.env.APP_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
