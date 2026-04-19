import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import {
  supabaseAdmin,
  jsonResponse,
  verifyFapshiWebhook,
  parseAmount,
  applyCommissionForContribution,
  getErrorMessage
} from "../shared.ts";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let webhookBody;
  try {
    webhookBody = await verifyFapshiWebhook(req);
  } catch (error) {
    return jsonResponse({ error: error.message }, 401);
  }

  const payload = webhookBody.data ?? webhookBody;
  const external_id = payload.externalId || payload.external_id || payload.reference;
  const status = (payload.status || payload.transaction_status || "").toString().toLowerCase();

  if (!external_id) {
    return jsonResponse({ error: "Missing external_id in webhook payload." }, 400);
  }

  if (status !== "success") {
    return jsonResponse({ message: "Webhook received, no successful payment to process." }, 200);
  }

  const amountValue = payload.amount ?? payload.value ?? 0;
  let amount;

  try {
    amount = parseAmount(amountValue);
  } catch (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  const { data: contribution, error: contributionError } = await supabaseAdmin
    .from("contributions")
    .select("*")
    .eq("external_id", external_id)
    .single();

  if (contributionError) {
    return jsonResponse({ error: contributionError.message }, 500);
  }

  if (!contribution) {
    return jsonResponse({ error: "Contribution record not found." }, 404);
  }

  if (contribution.status === "paid") {
    return jsonResponse({ message: "Contribution already processed." }, 200);
  }

  const paymentReference = payload.transactionId || payload.reference || contribution.payment_reference;

  const { error: updateError } = await supabaseAdmin
    .from("contributions")
    .update({
      status: "paid",
      payment_reference: paymentReference,
      date: new Date().toISOString()
    })
    .eq("id", contribution.id);

  if (updateError) {
    return jsonResponse({ error: updateError.message }, 500);
  }

  const { error: transactionError } = await supabaseAdmin.from("transactions").insert([
    {
      user_id: contribution.user_id,
      group_id: contribution.group_id,
      amount,
      type: "deposit",
      status: "success",
      reference: paymentReference,
      note: "Fapshi mobile money deposit"
    }
  ]);

  if (transactionError) {
    return jsonResponse({ error: transactionError.message }, 500);
  }

  try {
    const commissionResult = await applyCommissionForContribution(contribution.id);
    return jsonResponse({ success: true, commission: commissionResult });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});
