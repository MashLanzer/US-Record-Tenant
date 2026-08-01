import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { NotificationsProvider } from "@/lib/notifications";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <NotificationsProvider>
        <AppShell>{children}</AppShell>
      </NotificationsProvider>
    </AuthGuard>
  );
}
