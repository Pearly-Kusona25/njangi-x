import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * GET /functions/v1/get-messages
 * Query params: 
 *   - group_id (required)
 *   - limit (default 50)
 *   - offset (default 0)
 *   - before (optional): ISO timestamp to get messages before this time
 * 
 * Returns chat messages for a group.
 */
serve(async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const query = new URL(req.url).searchParams;
  const group_id = query.get("group_id");
  const limit = parseInt(query.get("limit") || "50");
  const offset = parseInt(query.get("offset") || "0");
  const before = query.get("before");

  if (!group_id) {
    return jsonResponse({ error: "group_id is required" }, 400);
  }

  let messagesQuery = supabaseAdmin
    .from("messages")
    .select(`
      *,
      sender:users(id, name, email, phone)
    `)
    .eq("group_id", group_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (before) {
    messagesQuery = messagesQuery.lt("created_at", before);
  }

  const { data: messages, error: messagesError } = await messagesQuery;

  if (messagesError) {
    return jsonResponse({ error: messagesError.message }, 500);
  }

  // Get total count
  const { count } = await supabaseAdmin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("group_id", group_id);

  return jsonResponse({
    messages: messages || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit
    }
  });
});