import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FAPSHI_API_KEY = Deno.env.get("FAPSHI_API_KEY") ?? "";
const FAPSHI_BASE_URL = Deno.env.get("FAPSHI_BASE_URL") ?? "https://api.fapshi.com/v1";
const FAPSHI_WEBHOOK_SECRET = Deno.env.get("FAPSHI_WEBHOOK_SECRET") ?? "";
const FAPSHI_WEBHOOK_URL = Deno.env.get("FAPSHI_WEBHOOK_URL") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function parseAmount(amount: unknown): number {
  const numeric = typeof amount === "string" ? Number(amount) : Number(amount ?? 0);
  if (Number.isNaN(numeric) || numeric <= 0) {
    throw new Error("Invalid amount. Amount must be a positive number.");
  }
  return Number(numeric.toFixed(2));
}

export function calculateCommission(amount: number): number {
  return Number((amount * 0.01).toFixed(2));
}

export function getFapshiHeaders() {
  if (!FAPSHI_API_KEY) {
    throw new Error("Missing Fapshi API key.");
  }

  return {
    Authorization: `Bearer ${FAPSHI_API_KEY}`,
    "Content-Type": "application/json"
  };
}

export async function createFapshiPayment(payload: Record<string, unknown>) {
  const response = await fetch(`${FAPSHI_BASE_URL}/payments`, {
    method: "POST",
    headers: getFapshiHeaders(),
    body: JSON.stringify(payload)
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.message || "Fapshi payment call failed.");
  }

  return body;
}

export async function verifyFapshiWebhook(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-fapshi-signature") || "";

  if (!FAPSHI_WEBHOOK_SECRET) {
    throw new Error("Missing Fapshi webhook secret.");
  }

  const expectedSignature = await computeHmac(rawBody, FAPSHI_WEBHOOK_SECRET);
  if (!timingSafeEqual(signature, expectedSignature)) {
    throw new Error("Invalid webhook signature.");
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid webhook JSON payload.");
  }
}

async function computeHmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function isGroupMember(group_id: string, user_id: string) {
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("group_id", group_id)
    .eq("user_id", user_id)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return !!data;
}

export async function isGroupLeader(group_id: string, user_id: string) {
  const { data, error } = await supabaseAdmin
    .from("groups")
    .select("id")
    .eq("id", group_id)
    .eq("leader_id", user_id)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return !!data;
}

export async function applyCommissionForContribution(contribution_id: string) {
  const { data: contribution, error: contributionError } = await supabaseAdmin
    .from("contributions")
    .select("id, user_id, group_id, amount, status, commission_amount")
    .eq("id", contribution_id)
    .single();

  if (contributionError) {
    throw new Error(contributionError.message);
  }

  if (!contribution) {
    throw new Error("Contribution record not found.");
  }

  if (contribution.status !== "paid") {
    throw new Error("Commission can only be applied to paid contributions.");
  }

  if (contribution.commission_amount && Number(contribution.commission_amount) > 0) {
    return { message: "Commission already applied." };
  }

  const commission = calculateCommission(Number(contribution.amount));
  const reference = `commission_${contribution.id}`;

  const { error: txError } = await supabaseAdmin.from("transactions").insert([
    {
      user_id: contribution.user_id,
      group_id: contribution.group_id,
      amount: commission,
      type: "commission",
      status: "success",
      reference,
      note: "Njangi-Sure platform commission"
    }
  ]);

  if (txError) {
    throw new Error(txError.message);
  }

  const { error: updateError } = await supabaseAdmin
    .from("contributions")
    .update({ commission_amount: commission })
    .eq("id", contribution.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { commission, reference };
}

export function buildFapshiCallbackUrl(external_id: string) {
  if (!FAPSHI_WEBHOOK_URL) {
    throw new Error("Missing Fapshi webhook URL.");
  }
  return `${FAPSHI_WEBHOOK_URL}?external_id=${encodeURIComponent(external_id)}`;
}

export function isErrorWithMessage(value: unknown): value is { message?: string } {
  return typeof value === "object" && value !== null && "message" in value;
}

export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message ?? "Unknown error occurred";
  }
  return String(error);
}
