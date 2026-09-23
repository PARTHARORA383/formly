import { AppHeader } from "@/components/app/app-header"
import { AuthGuard } from "@/components/app/auth-guard"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-svh flex-col">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </AuthGuard>
  )
}
