import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * POST /functions/v1/send-message
 * Body: { group_id, sender_id, message }
 * 
 * Sends a message to a group chat.
 */
serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { group_id, sender_id, message } = payload;

  if (!group_id || !sender_id || !message) {
    return jsonResponse({ error: "group_id, sender_id, and message are required" }, 400);
  }

  if (message.trim().length === 0) {
    return jsonResponse({ error: "Message cannot be empty" }, 400);
  }

  // Check if sender is a member of the group
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("group_id", group_id)
    .eq("user_id", sender_id)
    .single();

  if (membershipError || !membership) {
    return jsonResponse({ error: "User is not a member of this group" }, 403);
  }

  // Insert message
  const { data: newMessage, error: insertError } = await supabaseAdmin
    .from("messages")
    .insert([{
      group_id,
      sender_id,
      message: message.trim()
    }])
    .select(`
      *,
      sender:users(id, name, email)
    `)
    .single();

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500);
  }

  // Get all group members for notifications
  const { data: members, error: membersError } = await supabaseAdmin
    .from("members")
    .select("user_id")
    .eq("group_id", group_id)
    .neq("user_id", sender_id);

  if (!membersError && members && members.length > 0) {
    // Get sender name
    const { data: sender } = await supabaseAdmin
      .from("users")
      .select("name")
      .eq("id", sender_id)
      .single();

    const senderName = sender?.name || "A member";

    // Create notifications for other members
    const notifications = members.map(m => ({
      user_id: m.user_id,
      group_id,
      title: "New Message",
      body: `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`
    }));

    await supabaseAdmin.from("notifications").insert(notifications);
  }

  return jsonResponse({
    message: "Message sent successfully",
    data: newMessage
  }, 201);
});