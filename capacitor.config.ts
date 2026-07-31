import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tenanttrust.app",
  appName: "Tenant Trust",
  // Next.js static export output directory
  webDir: "out",
  backgroundColor: "#0E1A2B",
  ios: {
    contentInset: "always",
  },
  android: {
    backgroundColor: "#0E1A2B",
  },
};

export default config;
