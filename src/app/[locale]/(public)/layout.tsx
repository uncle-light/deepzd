import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navUser = user
    ? {
        name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      }
    : null;

  return (
    <>
      <Nav user={navUser} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
