const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "missing_code" }),
    };
  }

  try {
    const { data: entry, error } = await supabase
      .from("waitlist")
      .select("base_position, referral_code, confirmed")
      .eq("referral_code", code)
      .single();

    if (error || !entry || !entry.confirmed) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "not_found" }),
      };
    }

    const { count: referralCount } = await supabase
      .from("waitlist")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", code)
      .eq("confirmed", true);

    const effectivePosition = Math.max(1, entry.base_position - referralCount * 3);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        position: effectivePosition,
        referrals: referralCount,
        referral_link: `https://noctis-racing.com/?ref=${code}`,
      }),
    };
  } catch (err) {
    console.error("position error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "server_error" }),
    };
  }
};
