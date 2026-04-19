import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: contributions, error } = await supabaseAdmin
    .from("contributions")
    .select("id, user_id, group_id, amount")
    .eq("status", "pending")
    .lt("created_at", threshold)
    .limit(500);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  if (!contributions || contributions.length === 0) {
    return jsonResponse({ success: true, inserted: 0, message: "No pending contributions found." });
  }

  const notifications = contributions.map((contribution) => ({
    user_id: contribution.user_id,
    group_id: contribution.group_id,
    title: "Njangi-Sure contribution reminder",
    body: `You have a pending contribution of ${contribution.amount} XAF for your Njangi group. Please complete payment to stay on schedule.`,
    is_read: false,
    created_at: new Date().toISOString()
  }));

  const { data: insertedNotifications, error: insertError } = await supabaseAdmin
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500);
  }

  return jsonResponse({ success: true, inserted: insertedNotifications?.length ?? 0 });
});
