import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  supabaseAdmin,
  jsonResponse,
  parseAmount,
  createFapshiPayment,
  isGroupMember,
  isGroupLeader,
  buildFapshiCallbackUrl,
  getErrorMessage
} from "../shared.ts";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { amount, phone, user_id, group_id, provider = "MTN" } = payload;

  if (!amount || !phone || !user_id || !group_id) {
    return jsonResponse({ error: "Amount, phone, user_id, and group_id are required." }, 400);
  }

  let parsedAmount;
  try {
    parsedAmount = parseAmount(amount);
  } catch (error) {
    return jsonResponse({ error: getErrorMessage(error) }, 400);
  }

  const authorized =
    (await isGroupMember(group_id, user_id)) || (await isGroupLeader(group_id, user_id));

  if (!authorized) {
    return jsonResponse({ error: "User is not authorized for this group." }, 403);
  }

  const external_id = `${user_id}:${group_id}:${Date.now()}`;
  const payment_reference = `njangi-${crypto.randomUUID().slice(0, 8)}`;

  const { data: contribution, error: contributionError } = await supabaseAdmin
    .from("contributions")
    .insert([
      {
        user_id,
        group_id,
        amount: parsedAmount,
        status: "pending",
        payment_reference,
        external_id,
        date: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (contributionError) {
    return jsonResponse({ error: contributionError.message }, 500);
  }

  try {
    const paymentPayload = {
      amount: parsedAmount,
      phone,
      provider,
      externalId: external_id,
      reference: payment_reference,
      callback_url: buildFapshiCallbackUrl(external_id)
    };

    const fapshiResponse = await createFapshiPayment(paymentPayload);
    const paymentUrl = fapshiResponse?.data?.payment_url || fapshiResponse?.payment_url || fapshiResponse?.url;
    const externalReference =
      fapshiResponse?.data?.payment_reference ||
      fapshiResponse?.data?.reference ||
      fapshiResponse?.transactionId ||
      payment_reference;

    await supabaseAdmin
      .from("contributions")
      .update({ payment_reference: externalReference })
      .eq("id", contribution.id);

    return jsonResponse({
      success: true,
      contribution,
      payment_url: paymentUrl,
      external_id,
      provider,
      fapshi: fapshiResponse
    });
  } catch (error) {
    return jsonResponse({ error: getErrorMessage(error) }, 502);
  }
});
