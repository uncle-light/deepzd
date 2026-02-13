import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (!userId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      const item = subscription.items.data[0];
      const priceId = item?.price.id;

      // Map price ID to plan
      const planId = await resolvePlanId(supabase, priceId);

      await supabase
        .from("subscriptions")
        .update({
          plan_id: planId || "pro",
          status: "active",
          billing_cycle: session.metadata?.billing_cycle || "monthly",
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
          current_period_start: item ? new Date(item.current_period_start * 1000).toISOString() : null,
          current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
        })
        .eq("user_id", userId);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const subItem = sub.items.data[0];
      await supabase
        .from("subscriptions")
        .update({
          status: sub.status === "active" ? "active" : "past_due",
          current_period_start: subItem ? new Date(subItem.current_period_start * 1000).toISOString() : null,
          current_period_end: subItem ? new Date(subItem.current_period_end * 1000).toISOString() : null,
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ plan_id: "free", status: "active", stripe_subscription_id: null })
        .eq("stripe_subscription_id", sub.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoice.parent?.subscription_details?.subscription;
      if (subId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", typeof subId === "string" ? subId : subId.id);
      }
      break;
    }
  }

  return Response.json({ received: true });
}

async function resolvePlanId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  priceId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("plans")
    .select("id")
    .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
    .maybeSingle();
  return data?.id ?? null;
}
