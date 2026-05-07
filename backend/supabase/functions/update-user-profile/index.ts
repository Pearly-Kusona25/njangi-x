import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * PUT /functions/v1/update-user-profile
 * Body: { user_id, name?, phone? }
 * 
 * Updates user profile information.
 */
serve(async (req: Request) => {
  if (req.method !== "PUT" && req.method !== "PATCH") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { user_id, name, phone } = payload;

  if (!user_id) {
    return jsonResponse({ error: "user_id is required" }, 400);
  }

  if (!name && !phone) {
    return jsonResponse({ error: "At least one field to update (name or phone) is required" }, 400);
  }

  // Build update object
  const updateData: Record<string, string> = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;

  // Update user profile
  const { data: updatedUser, error: updateError } = await supabaseAdmin
    .from("users")
    .update(updateData)
    .eq("id", user_id)
    .select()
    .single();

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  return jsonResponse({
    message: "Profile updated successfully",
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role
    }
  });
});