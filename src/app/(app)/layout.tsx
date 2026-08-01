import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { BiometricGate } from "@/components/biometric-gate";
import { ConsentGate } from "@/components/consent-gate";
import { NotificationsProvider } from "@/lib/notifications";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <BiometricGate>
        <ConsentGate>
          <NotificationsProvider>
            <AppShell>{children}</AppShell>
          </NotificationsProvider>
        </ConsentGate>
      </BiometricGate>
    </AuthGuard>
  );
}
