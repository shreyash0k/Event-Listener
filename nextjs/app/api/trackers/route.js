import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { getUserPlanLimits } from "@/lib/subscriptions";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, url, prompt, interval } = await req.json();

    // Get user's current tracker count
    const { data: userData } = await supabase
      .from('users')
      .select('tracker_count, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    // Get plan limits
    const planLimits = await getUserPlanLimits(userData.stripe_customer_id);

    if (userData.tracker_count >= planLimits.trackers) {
      return NextResponse.json(
        { error: "Tracker limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Create tracker and increment count in a transaction
    const { data, error } = await supabase
      .from('trackers')
      .insert({
        user_id: user.id,
        name: name,
        url: url,
        prompt: prompt,
        check_interval: interval,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Increment tracker count
    const { error: updateError } = await supabase
      .from('users')
      .update({ tracker_count: userData.tracker_count + 1 })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating tracker:', error);
    return NextResponse.json(
      { error: "Failed to create tracker" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('trackers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching trackers:', error);
    return NextResponse.json(
      { error: "Failed to fetch trackers" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Tracker ID is required" },
        { status: 400 }
      );
    }

    // Get current tracker count first
    const { data: userData } = await supabase
      .from('users')
      .select('tracker_count')
      .eq('user_id', user.id)
      .single();

    // Delete the tracker
    const { error } = await supabase
      .from('trackers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Decrement tracker count using the fetched count
    const { error: updateError } = await supabase
      .from('users')
      .update({ tracker_count: userData.tracker_count - 1 })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tracker:', error);
    return NextResponse.json(
      { error: "Failed to delete tracker" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, url, prompt, interval } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Tracker ID is required" },
        { status: 400 }
      );
    }

    // Update tracker (only if it belongs to the user)
    const { data, error } = await supabase
      .from('trackers')
      .update({
        name,
        url,
        prompt,
        check_interval: interval,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own trackers
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating tracker:', error);
    return NextResponse.json(
      { error: "Failed to update tracker" },
      { status: 500 }
    );
  }
} 