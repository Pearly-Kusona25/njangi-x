import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * GET /functions/v1/get-user-profile
 * Query params: user_id (required)
 * 
 * Returns user profile information including groups and stats.
 */
serve(async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const query = new URL(req.url).searchParams;
  const user_id = query.get("user_id");

  if (!user_id) {
    return jsonResponse({ error: "user_id is required" }, 400);
  }

  // Get user profile
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", user_id)
    .single();

  if (userError) {
    return jsonResponse({ error: userError.message }, 500);
  }

  if (!user) {
    return jsonResponse({ error: "User not found" }, 404);
  }

  // Get user's groups
  const { data: memberships, error: membershipsError } = await supabaseAdmin
    .from("members")
    .select(`
      *,
      group:groups(id, name, contribution_amount, frequency, status, leader_id)
    `)
    .eq("user_id", user_id);

  if (membershipsError) {
    return jsonResponse({ error: membershipsError.message }, 500);
  }

  // Get user's contributions
  const { data: contributions, error: contributionsError } = await supabaseAdmin
    .from("contributions")
    .select("status, amount, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (contributionsError) {
    return jsonResponse({ error: contributionsError.message }, 500);
  }

  // Get user's transactions
  const { data: transactions, error: transactionsError } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (transactionsError) {
    return jsonResponse({ error: transactionsError.message }, 500);
  }

  // Calculate stats
  const totalContributed = contributions
    ?.filter(c => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  const totalReceived = transactions
    ?.filter(t => t.type === "payout" && t.status === "success")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  return jsonResponse({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    },
    groups: memberships || [],
    stats: {
      total_groups: memberships?.length || 0,
      total_contributed: totalContributed,
      total_received: totalReceived,
      contributions_count: contributions?.length || 0
    },
    recent_contributions: contributions || [],
    recent_transactions: transactions || []
  });
});