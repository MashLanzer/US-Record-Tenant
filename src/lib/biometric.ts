"use client";

import { isNativeApp } from "@/lib/platform";

/**
 * Thin wrapper over @aparajita/capacitor-biometric-auth. Uses dynamic imports
 * so the plugin is only loaded inside the native app — the web/static build
 * never bundles native code. All calls degrade gracefully off-device.
 */

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
    const info = await BiometricAuth.checkBiometry();
    return !!info.isAvailable;
  } catch {
    return false;
  }
}

/** Prompt for Face ID / fingerprint. Resolves true on success, false otherwise. */
export async function authenticateBiometric(reason: string): Promise<boolean> {
  if (!isNativeApp()) return true; // nothing to gate on the web
  try {
    const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Cancel",
      allowDeviceCredential: true,
      androidTitle: "Tenant Trust",
      androidSubtitle: reason,
      androidConfirmationRequired: false,
    });
    return true;
  } catch {
    return false;
  }
}
