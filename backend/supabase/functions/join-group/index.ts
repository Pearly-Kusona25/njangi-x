import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * POST /functions/v1/join-group
 * Body: { user_id, group_id }
 * 
 * Allows a user to join an existing group.
 */
serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { user_id, group_id } = payload;

  if (!user_id || !group_id) {
    return jsonResponse({ error: "user_id and group_id are required" }, 400);
  }

  // Check if group exists and is active
  const { data: group, error: groupError } = await supabaseAdmin
    .from("groups")
    .select("id, name, status, total_members")
    .eq("id", group_id)
    .single();

  if (groupError) {
    return jsonResponse({ error: "Group not found" }, 404);
  }

  if (group.status !== "active") {
    return jsonResponse({ error: "Group is not active" }, 400);
  }

  // Check if user is already a member
  const { data: existingMember, error: memberCheckError } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("user_id", user_id)
    .eq("group_id", group_id)
    .single();

  if (existingMember) {
    return jsonResponse({ error: "User is already a member of this group" }, 400);
  }

  // Check if group is full
  const { count: memberCount, error: countError } = await supabaseAdmin
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", group_id);

  if (countError) {
    return jsonResponse({ error: countError.message }, 500);
  }

  if (memberCount !== null && memberCount >= group.total_members) {
    return jsonResponse({ error: "Group is full" }, 400);
  }

  // Get the next payout position
  const { data: lastMember, error: lastMemberError } = await supabaseAdmin
    .from("members")
    .select("payout_position")
    .eq("group_id", group_id)
    .order("payout_position", { ascending: false })
    .limit(1)
    .single();

  const nextPayoutPosition = lastMember ? lastMember.payout_position + 1 : 0;

  // Add user to group
  const { data: newMember, error: insertError } = await supabaseAdmin
    .from("members")
    .insert([{
      user_id,
      group_id,
      payout_position: nextPayoutPosition
    }])
    .select()
    .single();

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500);
  }

  // Create notification for group leader
  const { data: leaderGroup, error: leaderError } = await supabaseAdmin
    .from("groups")
    .select("leader_id")
    .eq("id", group_id)
    .single();

  if (!leaderError && leaderGroup) {
    await supabaseAdmin
      .from("notifications")
      .insert([{
        user_id: leaderGroup.leader_id,
        group_id,
        title: "New Member",
        body: `A new member has joined your group "${group.name}"`
      }]);
  }

  return jsonResponse({
    message: "Successfully joined group",
    member: newMember
  }, 201);
});