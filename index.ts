import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get first admin user for event creation
    const { data: adminUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_admin", true)
      .limit(1)
      .maybeSingle();

    // Seed events if admin exists and no events yet
    const { count: eventCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    if (adminUser && (eventCount || 0) === 0) {
      await supabase.from("events").insert([
        {
          title: "Q2 Sales Kickoff Webinar",
          description: "Join us for the quarterly sales kickoff where we reveal new targets, incentives, and strategies for the upcoming quarter.",
          event_type: "webinar",
          scheduled_at: new Date(Date.now() + 7 * 86400000).toISOString(),
          location: "Online - Zoom",
          created_by: adminUser.id,
        },
        {
          title: "Advanced Closing Workshop",
          description: "An intensive hands-on workshop covering advanced closing techniques with role-playing exercises.",
          event_type: "workshop",
          scheduled_at: new Date(Date.now() + 14 * 86400000).toISOString(),
          location: "Conference Room A - HQ",
          created_by: adminUser.id,
        },
        {
          title: "Annual Sales Conference 2026",
          description: "Our biggest event of the year featuring keynote speakers, breakout sessions, and networking opportunities.",
          event_type: "conference",
          scheduled_at: new Date(Date.now() + 30 * 86400000).toISOString(),
          location: "Grand Convention Center",
          created_by: adminUser.id,
        },
      ]);
    }

    // Seed sample posts if none exist
    const { count: postCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    if ((postCount || 0) === 0 && adminUser) {
      await supabase.from("posts").insert([
        { user_id: adminUser.id, content: "Welcome to SalesHub! This is your community feed where you can share wins, ask questions, and connect with fellow sales professionals.", likes_count: 12, comments_count: 3 },
        { user_id: adminUser.id, content: "Just closed a $50K deal using the negotiation techniques from the training library. The ROI on these videos is incredible!", likes_count: 24, comments_count: 7 },
        { user_id: adminUser.id, content: "Reminder: Q2 Sales Kickoff Webinar is next week. Make sure to register and prepare your Q1 performance summary.", likes_count: 8, comments_count: 2 },
      ]);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Seed data created" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
