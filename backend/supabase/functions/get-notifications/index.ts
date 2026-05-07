import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * GET /functions/v1/get-notifications
 * Query params: 
 *   - user_id (required)
 *   - unread_only (optional): only return unread notifications
 *   - limit (default 20)
 *   - offset (default 0)
 * 
 * Returns user notifications.
 */
serve(async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const query = new URL(req.url).searchParams;
  const user_id = query.get("user_id");
  const unread_only = query.get("unread_only") === "true";
  const limit = parseInt(query.get("limit") || "20");
  const offset = parseInt(query.get("offset") || "0");

  if (!user_id) {
    return jsonResponse({ error: "user_id is required" }, 400);
  }

  let notificationsQuery = supabaseAdmin
    .from("notifications")
    .select(`
      *,
      group:groups(id, name)
    `)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (unread_only) {
    notificationsQuery = notificationsQuery.eq("is_read", false);
  }

  const { data: notifications, error: notificationsError } = await notificationsQuery;

  if (notificationsError) {
    return jsonResponse({ error: notificationsError.message }, 500);
  }

  // Get unread count
  const { count: unreadCount } = await supabaseAdmin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("is_read", false);

  // Get total count
  const { count: totalCount } = await supabaseAdmin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user_id);

  return jsonResponse({
    notifications: notifications || [],
    unread_count: unreadCount || 0,
    pagination: {
      total: totalCount || 0,
      limit,
      offset,
      has_more: (totalCount || 0) > offset + limit
    }
  });
});