import { createClient } from "@/lib/supabase/server";

/** Return the current user's subscription plan ID */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ plan: "free" });
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  return Response.json({ plan: data?.plan_id ?? "free" });
}
