const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 302,
      headers: { Location: "https://noctis-racing.com/?error=missing_code" },
      body: "",
    };
  }

  try {
    await supabase
      .from("waitlist")
      .update({ deleted_at: new Date().toISOString() })
      .eq("referral_code", code)
      .is("deleted_at", null);

    return {
      statusCode: 302,
      headers: { Location: "https://noctis-racing.com/?unsubscribed=true" },
      body: "",
    };
  } catch (err) {
    console.error("unsubscribe error:", err);
    return {
      statusCode: 302,
      headers: { Location: "https://noctis-racing.com/?error=server_error" },
      body: "",
    };
  }
};
