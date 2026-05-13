import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-card p-6 rounded-lg border">
        <p className="text-lg">Welcome, {session.user?.name}!</p>
        <p className="text-muted-foreground mt-2">{session.user?.email}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Role: {(session.user as any)?.role || "USER"}
        </p>
      </div>
    </div>
  );
}
