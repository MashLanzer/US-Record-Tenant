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
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: "#0E1A2B",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
