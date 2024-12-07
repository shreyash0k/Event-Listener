import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';
import { findCheckoutSession } from "@/libs/stripe";
import { SUBSCRIPTION_PLANS, getPlanByPriceId } from '@/subscriptions.config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Supabase client with service role. Since the webhook won't have the auth JWT, we can't use RLS and need to use the service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let data;
  let eventType;
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  data = event.data;
  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        console.log("checkout.session.completed");
        const session = await findCheckoutSession(data.object.id);
        
        const { error: userError } = await supabase
          .from('users')
          .update({
            stripe_customer_id: session.customer,
            subscription_status: 'active',
            check_count: 0,
            tracker_count: 0
          })
          .eq('id', data.object.client_reference_id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Update directly using stripe_customer_id
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: subscription.status
          })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Update directly using stripe_customer_id
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'canceled'
          })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }

      case "invoice.paid": {
        // This event fires when a subscription renews
        const subscription = event.data.object;
        
        // Reset the usage count for this billing period
        const { error } = await supabase
          .from('users')
          .update({
            check_count: 0,  // Reset check counter
            last_counter_reset_date: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        
        // Update subscription status to reflect payment failure
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'past_due'
          })
          .eq('stripe_customer_id', invoice.customer);
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Fires 3 days before trial ends
        // You might want to email the user or show UI warnings
        const subscription = event.data.object;
        break;
      }
    }

    return NextResponse.json({});
  } catch (e) {
    console.error("stripe error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
