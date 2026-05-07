import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * GET /functions/v1/list-groups
 * Query params: 
 *   - status (optional): filter by status (active, paused, completed)
 *   - user_id (optional): filter by user's membership
 *   - limit (optional): number of results (default 20)
 *   - offset (optional): pagination offset (default 0)
 * 
 * Returns a list of groups with optional filtering.
 */
serve(async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const query = new URL(req.url).searchParams;
  const status = query.get("status");
  const user_id = query.get("user_id");
  const limit = parseInt(query.get("limit") || "20");
  const offset = parseInt(query.get("offset") || "0");

  let groupsQuery = supabaseAdmin
    .from("groups")
    .select(`
      *,
      leader:users!groups_leader_id_fkey(id, name, email, phone, role),
      members_count:members(count)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    groupsQuery = groupsQuery.eq("status", status);
  }

  const { data: groups, error: groupsError } = await groupsQuery;

  if (groupsError) {
    return jsonResponse({ error: groupsError.message }, 500);
  }

  // If user_id provided, check membership for each group
  let groupsWithMembership = groups || [];
  if (user_id) {
    const groupIds = groups?.map(g => g.id) || [];
    
    if (groupIds.length > 0) {
      const { data: memberships, error: membershipError } = await supabaseAdmin
        .from("members")
        .select("group_id")
        .eq("user_id", user_id)
        .in("group_id", groupIds);

      if (!membershipError && memberships) {
        const memberGroupIds = new Set(memberships.map(m => m.group_id));
        groupsWithMembership = groups?.map(group => ({
          ...group,
          is_member: memberGroupIds.has(group.id)
        })) || [];
      }
    }
  }

  // Get total count
  let countQuery = supabaseAdmin
    .from("groups")
    .select("*", { count: "exact", head: true });

  if (status) {
    countQuery = countQuery.eq("status", status);
  }

  const { count } = await countQuery;

  return jsonResponse({
    groups: groupsWithMembership,
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit
    }
  });
});