const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return "NCT-" + code;
}

function generateToken() {
  return [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

function confirmationEmail(confirmUrl) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07070a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070a;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0e15;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#1a1030,#0f0e15);padding:40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:0.12em;color:#ffffff;">NOCTIS</p>
          <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.3em;color:#9b6bff;text-transform:uppercase;">Racing · Custom Sticker</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;font-weight:700;">Fast geschafft.</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#a6a2b4;line-height:1.6;">
            Bestätige deine E-Mail-Adresse um deinen Platz auf der NOCTIS Warteliste zu sichern und 40&nbsp;% Rabatt zum Release zu erhalten.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
            <tr><td style="background:linear-gradient(180deg,#9b6bff,#7c3aed);border-radius:999px;">
              <a href="${confirmUrl}" style="display:inline-block;padding:16px 38px;font-size:14px;font-weight:700;letter-spacing:0.08em;color:#ffffff;text-decoration:none;text-transform:uppercase;">
                E-Mail bestätigen →
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:12px;color:#6b6878;text-align:center;">
            Dieser Link ist 24&nbsp;Stunden gültig.<br>
            Falls du dich nicht angemeldet hast, ignoriere diese E-Mail.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:#4a4760;">
            © 2026 NOCTIS Racing · <a href="https://noctis-racing.com/datenschutz" style="color:#4a4760;">Datenschutz</a> ·
            <a href="https://noctis-racing.com/impressum" style="color:#4a4760;">Impressum</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method not allowed" };
  }

  try {
    const { email, ref } = JSON.parse(event.body || "{}");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "invalid_email" }),
      };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Bereits bestätigt?
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id, confirmed, confirm_token")
      .eq("email", cleanEmail)
      .single();

    if (existing?.confirmed) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: "already_confirmed" }),
      };
    }

    const confirm_token = generateToken();
    const token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    if (existing) {
      // Bestätigungsmail erneut senden
      await supabase.from("waitlist").update({ confirm_token, token_expires }).eq("email", cleanEmail);
    } else {
      // Neuer Eintrag
      const { error } = await supabase.from("waitlist").insert({
        email: cleanEmail,
        referral_code: generateReferralCode(),
        referred_by: ref || null,
        confirm_token,
        token_expires,
      });
      if (error) throw error;
    }

    // Bestätigungsmail via Brevo
    const confirmUrl = `https://noctis-racing.com/.netlify/functions/confirm?token=${confirm_token}`;

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "NOCTIS Racing", email: "noreply@noctis-racing.com" },
        to: [{ email: cleanEmail }],
        subject: "Bestätige deine NOCTIS Wartelisten-Anmeldung",
        htmlContent: confirmationEmail(confirmUrl),
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("Brevo error:", errText);
      throw new Error("Email delivery failed");
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ status: "confirmation_sent" }),
    };
  } catch (err) {
    console.error("signup error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "server_error" }),
    };
  }
};
