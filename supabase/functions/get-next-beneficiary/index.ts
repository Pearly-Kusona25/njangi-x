import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

serve(async (req) => {
  const query = new URL(req.url).searchParams;
  const group_id = query.get("group_id") ?? (await req.json().then((body) => body?.group_id).catch(() => null));

  if (!group_id) {
    return jsonResponse({ error: "group_id is required." }, 400);
  }

  const { data: members, error: membersError } = await supabaseAdmin
    .from("members")
    .select("payout_position, user_id, users(id, name, email, phone, role)")
    .eq("group_id", group_id)
    .order("payout_position", { ascending: true });

  if (membersError) {
    return jsonResponse({ error: membersError.message }, 500);
  }

  if (!members || members.length === 0) {
    return jsonResponse({ error: "No members found for this group." }, 404);
  }

  const { data: lastPayout, error: payoutError } = await supabaseAdmin
    .from("transactions")
    .select("user_id")
    .eq("group_id", group_id)
    .eq("type", "payout")
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (payoutError && payoutError.code !== "PGRST116") {
    return jsonResponse({ error: payoutError.message }, 500);
  }

  const ordered = members;
  let nextIndex = 0;

  if (lastPayout && lastPayout.user_id) {
    const lastIndex = ordered.findIndex((member) => member.user_id === lastPayout.user_id);
    if (lastIndex >= 0) {
      nextIndex = (lastIndex + 1) % ordered.length;
    }
  }

  const nextMember = ordered[nextIndex];

  return jsonResponse({
    success: true,
    next_beneficiary: {
      payout_position: nextMember.payout_position,
      user_id: nextMember.user_id,
      profile: nextMember.users
    }
  });
});
