import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * GET /functions/v1/get-group-details
 * Query params: group_id (required)
 * 
 * Returns detailed information about a group including members and stats.
 */
serve(async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const query = new URL(req.url).searchParams;
  const group_id = query.get("group_id");

  if (!group_id) {
    return jsonResponse({ error: "group_id is required" }, 400);
  }

  // Get group details
  const { data: group, error: groupError } = await supabaseAdmin
    .from("groups")
    .select(`
      *,
      leader:users!groups_leader_id_fkey(id, name, email, phone, role)
    `)
    .eq("id", group_id)
    .single();

  if (groupError) {
    return jsonResponse({ error: groupError.message }, 500);
  }

  if (!group) {
    return jsonResponse({ error: "Group not found" }, 404);
  }

  // Get members with user details
  const { data: members, error: membersError } = await supabaseAdmin
    .from("members")
    .select(`
      *,
      user:users(id, name, email, phone, role)
    `)
    .eq("group_id", group_id)
    .order("payout_position", { ascending: true });

  if (membersError) {
    return jsonResponse({ error: membersError.message }, 500);
  }

  // Get contribution stats
  const { data: stats, error: statsError } = await supabaseAdmin
    .from("contributions")
    .select("status, amount")
    .eq("group_id", group_id);

  if (statsError) {
    return jsonResponse({ error: statsError.message }, 500);
  }

  const totalContributions = stats?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  const paidContributions = stats?.filter(c => c.status === "paid").length || 0;
  const pendingContributions = stats?.filter(c => c.status === "pending").length || 0;

  // Get recent transactions
  const { data: transactions, error: txError } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("group_id", group_id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (txError) {
    return jsonResponse({ error: txError.message }, 500);
  }

  return jsonResponse({
    group: {
      id: group.id,
      name: group.name,
      contribution_amount: group.contribution_amount,
      frequency: group.frequency,
      total_members: group.total_members,
      start_date: group.start_date,
      status: group.status,
      created_at: group.created_at,
      leader: group.leader
    },
    members: members || [],
    stats: {
      total_contributions: totalContributions,
      paid_contributions: paidContributions,
      pending_contributions: pendingContributions,
      member_count: members?.length || 0
    },
    recent_transactions: transactions || []
  });
});