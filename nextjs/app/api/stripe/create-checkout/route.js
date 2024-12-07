import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { createCheckout } from "@/lib/stripe";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)

// By default, it doesn't force users to be authenticated. But if they are, it will prefill the Checkout data with their email and/or credit card

export async function POST(req) {
  const body = await req.json();
  console.log('Received request body:', body);  // Add this line

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { priceId, mode, successUrl, cancelUrl } = body;

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      clientReferenceId: user.id,
      user: user.email ? {
        email: user.email,
      } : undefined,
    });

    console.log('Stripe session created:', stripeSessionURL);
    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error('Error creating Stripe session:', e);  // Modify this line
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
