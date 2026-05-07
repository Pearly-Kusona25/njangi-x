import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * GET /functions/v1/get-contributions
 * Query params: 
 *   - user_id (optional): filter by user
 *   - group_id (optional): filter by group
 *   - status (optional): filter by status
 *   - limit (default 20)
 *   - offset (default 0)
 * 
 * Returns contribution records with optional filtering.
 */
serve(async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const query = new URL(req.url).searchParams;
  const user_id = query.get("user_id");
  const group_id = query.get("group_id");
  const status = query.get("status");
  const limit = parseInt(query.get("limit") || "20");
  const offset = parseInt(query.get("offset") || "0");

  if (!user_id && !group_id) {
    return jsonResponse({ error: "At least user_id or group_id is required" }, 400);
  }

  let contributionsQuery = supabaseAdmin
    .from("contributions")
    .select(`
      *,
      user:users(id, name, email, phone),
      group:groups(id, name)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (user_id) {
    contributionsQuery = contributionsQuery.eq("user_id", user_id);
  }

  if (group_id) {
    contributionsQuery = contributionsQuery.eq("group_id", group_id);
  }

  if (status) {
    contributionsQuery = contributionsQuery.eq("status", status);
  }

  const { data: contributions, error: contributionsError } = await contributionsQuery;

  if (contributionsError) {
    return jsonResponse({ error: contributionsError.message }, 500);
  }

  // Get total count
  let countQuery = supabaseAdmin
    .from("contributions")
    .select("*", { count: "exact", head: true });

  if (user_id) {
    countQuery = countQuery.eq("user_id", user_id);
  }

  if (group_id) {
    countQuery = countQuery.eq("group_id", group_id);
  }

  if (status) {
    countQuery = countQuery.eq("status", status);
  }

  const { count } = await countQuery;

  // Calculate totals
  const totalAmount = contributions
    ?.filter(c => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  return jsonResponse({
    contributions: contributions || [],
    summary: {
      total_amount: totalAmount,
      total_count: count || 0
    },
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit
    }
  });
});