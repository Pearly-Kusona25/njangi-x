import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { supabaseAdmin, jsonResponse } from "../shared.ts";

/**
 * GET /functions/v1/get-transactions
 * Query params: 
 *   - user_id (optional): filter by user
 *   - group_id (optional): filter by group
 *   - type (optional): filter by type (deposit, commission, payout, refund)
 *   - status (optional): filter by status
 *   - limit (default 20)
 *   - offset (default 0)
 * 
 * Returns transaction records with optional filtering.
 */
serve(async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const query = new URL(req.url).searchParams;
  const user_id = query.get("user_id");
  const group_id = query.get("group_id");
  const type = query.get("type");
  const status = query.get("status");
  const limit = parseInt(query.get("limit") || "20");
  const offset = parseInt(query.get("offset") || "0");

  if (!user_id && !group_id) {
    return jsonResponse({ error: "At least user_id or group_id is required" }, 400);
  }

  let transactionsQuery = supabaseAdmin
    .from("transactions")
    .select(`
      *,
      user:users(id, name, email),
      group:groups(id, name)
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (user_id) {
    transactionsQuery = transactionsQuery.eq("user_id", user_id);
  }

  if (group_id) {
    transactionsQuery = transactionsQuery.eq("group_id", group_id);
  }

  if (type) {
    transactionsQuery = transactionsQuery.eq("type", type);
  }

  if (status) {
    transactionsQuery = transactionsQuery.eq("status", status);
  }

  const { data: transactions, error: transactionsError } = await transactionsQuery;

  if (transactionsError) {
    return jsonResponse({ error: transactionsError.message }, 500);
  }

  // Get total count
  let countQuery = supabaseAdmin
    .from("transactions")
    .select("*", { count: "exact", head: true });

  if (user_id) {
    countQuery = countQuery.eq("user_id", user_id);
  }

  if (group_id) {
    countQuery = countQuery.eq("group_id", group_id);
  }

  if (type) {
    countQuery = countQuery.eq("type", type);
  }

  if (status) {
    countQuery = countQuery.eq("status", status);
  }

  const { count } = await countQuery;

  // Calculate totals by type
  const totals = {
    deposits: 0,
    payouts: 0,
    commissions: 0,
    refunds: 0
  };

  transactions?.forEach(t => {
    if (t.status === "success") {
      const amount = Number(t.amount);
      switch (t.type) {
        case "deposit":
          totals.deposits += amount;
          break;
        case "payout":
          totals.payouts += amount;
          break;
        case "commission":
          totals.commissions += amount;
          break;
        case "refund":
          totals.refunds += amount;
          break;
      }
    }
  });

  return jsonResponse({
    transactions: transactions || [],
    totals,
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit
    }
  });
});