import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { jsonResponse, applyCommissionForContribution, getErrorMessage } from "../shared.ts";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const payload = await req.json().catch(() => null);
  if (!payload || !payload.contribution_id) {
    return jsonResponse({ error: "Missing contribution_id in request body." }, 400);
  }

  try {
    const result = await applyCommissionForContribution(payload.contribution_id);
    return jsonResponse({ success: true, ...result });
  } catch (error) {
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
});
