import { createClient } from "@/lib/supabase/server";

interface QuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: string;
}

function isQuotaEnforced(): boolean {
  const value = process.env.ENFORCE_QUOTA?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

/**
 * 检查用户当月配额
 */
export async function checkQuota(userId: string): Promise<QuotaResult> {
  const supabase = await createClient();
  const period = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  // 并行查询订阅和使用量
  const [subRes, usageRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan_id, status, plans(analysis_limit)")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("usage")
      .select("analysis_count")
      .eq("user_id", userId)
      .eq("period", period)
      .maybeSingle(),
  ]);

  const plan = (subRes.data?.plan_id as string) || "free";
  const plans = subRes.data?.plans as unknown as { analysis_limit: number }[] | { analysis_limit: number } | null;
  const limit = (Array.isArray(plans) ? plans[0]?.analysis_limit : plans?.analysis_limit) ?? 5;
  const used = usageRes.data?.analysis_count ?? 0;

  // Temporary relaxed mode: quota is counted but not enforced.
  if (!isQuotaEnforced()) {
    return {
      allowed: true,
      remaining: limit === -1 ? -1 : Math.max(0, limit - used),
      limit,
      plan,
    };
  }

  // -1 表示无限制
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1, plan };
  }

  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
    limit,
    plan,
  };
}

/**
 * 递增当月使用量（upsert）
 */
export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createClient();
  const period = new Date().toISOString().slice(0, 7);

  // 尝试更新，如果不存在则插入
  const { data } = await supabase
    .from("usage")
    .select("id, analysis_count")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();

  if (data) {
    await supabase
      .from("usage")
      .update({ analysis_count: data.analysis_count + 1 })
      .eq("id", data.id);
  } else {
    await supabase
      .from("usage")
      .insert({ user_id: userId, period, analysis_count: 1 });
  }
}
