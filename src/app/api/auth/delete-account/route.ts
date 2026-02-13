import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete user data (RLS will handle cascading)
  await supabase.from("analyses").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);

  return Response.json({ success: true });
}
