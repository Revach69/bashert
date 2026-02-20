import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await getSession();
  } catch {
    redirect("/auth/login");
  }

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
