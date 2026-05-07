import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * POST /functions/v1/mark-notification-read
 * Body: { notification_id } or { notification_ids: [] }
 * 
 * Marks one or more notifications as read.
 */
serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { notification_id, notification_ids } = payload;

  if (!notification_id && (!notification_ids || notification_ids.length === 0)) {
    return jsonResponse({ error: "notification_id or notification_ids is required" }, 400);
  }

  let idsToUpdate: string[] = [];
  
  if (notification_id) {
    idsToUpdate = [notification_id];
  } else {
    idsToUpdate = notification_ids;
  }

  const { error: updateError } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .in("id", idsToUpdate);

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  return jsonResponse({
    message: "Notifications marked as read",
    updated_count: idsToUpdate.length
  });
});