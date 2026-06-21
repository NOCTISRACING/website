const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function welcomeEmail(position, referralUrl, referralCode) {
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
          <h1 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:700;">Du bist dabei. 🎉</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#a6a2b4;line-height:1.6;">
            Willkommen auf der NOCTIS Warteliste. Du erhältst automatisch 40&nbsp;% Rabatt zum Release — kein Code nötig.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#9b6bff;">Dein Wartelistenplatz</p>
              <p style="margin:0;font-size:48px;font-weight:900;color:#ffffff;">#${position}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#9b6bff;">Dein Empfehlungslink</p>
              <p style="margin:0;font-size:13px;color:#ffffff;font-family:monospace;word-break:break-all;">${referralUrl}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;color:#a6a2b4;line-height:1.6;">
            <strong style="color:#ffffff;">Rücke vor:</strong> Für jede Person, die sich über deinen Link anmeldet und bestätigt, rückst du <strong style="color:#9b6bff;">3 Plätze</strong> nach vorne.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background:linear-gradient(180deg,#9b6bff,#7c3aed);border-radius:999px;">
              <a href="${referralUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:700;letter-spacing:0.08em;color:#ffffff;text-decoration:none;text-transform:uppercase;">
                Link teilen →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:#4a4760;">
            © 2026 NOCTIS Racing · <a href="https://noctis-racing.com/datenschutz" style="color:#4a4760;">Datenschutz</a> ·
            <a href="https://noctis-racing.com/impressum" style="color:#4a4760;">Impressum</a> ·
            <a href="https://noctis-racing.com/.netlify/functions/unsubscribe?code=${referralCode}" style="color:#4a4760;">Abmelden</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function referrerUpdateEmail(newPosition, referralCount, referralUrl, referralCode) {
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
          <h1 style="margin:0 0 8px;font-size:22px;color:#ffffff;font-weight:700;">+3 Plätze vorgerückt!</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#a6a2b4;line-height:1.6;">
            Jemand hat sich über deinen Link angemeldet und bestätigt. Du hast jetzt ${referralCount} erfolgreiche Empfehlung${referralCount === 1 ? "" : "en"}.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#9b6bff;">Dein neuer Platz</p>
              <p style="margin:0;font-size:48px;font-weight:900;color:#ffffff;">#${newPosition}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;color:#a6a2b4;line-height:1.6;">
            Teile deinen Link weiter — jede weitere Empfehlung bringt dich <strong style="color:#9b6bff;">3 Plätze</strong> näher an Platz 1.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background:linear-gradient(180deg,#9b6bff,#7c3aed);border-radius:999px;">
              <a href="${referralUrl}" style="display:inline-block;padding:14px 32px;font-size:13px;font-weight:700;letter-spacing:0.08em;color:#ffffff;text-decoration:none;text-transform:uppercase;">
                Link teilen →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:#4a4760;">
            © 2026 NOCTIS Racing · <a href="https://noctis-racing.com/datenschutz" style="color:#4a4760;">Datenschutz</a> ·
            <a href="https://noctis-racing.com/impressum" style="color:#4a4760;">Impressum</a> ·
            <a href="https://noctis-racing.com/.netlify/functions/unsubscribe?code=${referralCode}" style="color:#4a4760;">Abmelden</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendEmail(to, subject, html) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "NOCTIS Racing", email: "noreply@noctis-racing.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) console.error("Brevo send error:", await res.text());
}

exports.handler = async (event) => {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return {
      statusCode: 302,
      headers: { Location: "https://noctis-racing.com/?error=missing_token" },
      body: "",
    };
  }

  try {
    // Token suchen
    const { data: entry, error } = await supabase
      .from("waitlist")
      .select("id, email, referral_code, referred_by, confirmed, token_expires")
      .eq("confirm_token", token)
      .single();

    if (error || !entry) {
      return {
        statusCode: 302,
        headers: { Location: "https://noctis-racing.com/?error=invalid_token" },
        body: "",
      };
    }

    if (entry.confirmed) {
      return {
        statusCode: 302,
        headers: { Location: `https://noctis-racing.com/?confirmed=true&code=${entry.referral_code}` },
        body: "",
      };
    }

    if (new Date(entry.token_expires) < new Date()) {
      return {
        statusCode: 302,
        headers: { Location: "https://noctis-racing.com/?error=token_expired" },
        body: "",
      };
    }

    // Nächste Position berechnen
    const { data: posData } = await supabase.rpc("next_base_position");
    const base_position = posData || 1;

    // Eintrag bestätigen
    await supabase.from("waitlist").update({
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      base_position,
      confirm_token: null,
      token_expires: null,
    }).eq("id", entry.id);

    const referralUrl = `https://noctis-racing.com/?ref=${entry.referral_code}`;
    const effectivePosition = base_position;

    // Willkommensmail an neuen User
    await sendEmail(
      entry.email,
      `Willkommen bei NOCTIS — du bist auf Platz #${effectivePosition}`,
      welcomeEmail(effectivePosition, referralUrl, entry.referral_code)
    );

    // Referrer benachrichtigen (wenn vorhanden)
    if (entry.referred_by) {
      const { data: referrer } = await supabase
        .from("waitlist")
        .select("email, referral_code, base_position")
        .eq("referral_code", entry.referred_by)
        .eq("confirmed", true)
        .single();

      if (referrer) {
        const { count: refCount } = await supabase
          .from("waitlist")
          .select("id", { count: "exact", head: true })
          .eq("referred_by", referrer.referral_code)
          .eq("confirmed", true);

        const newPosition = Math.max(1, referrer.base_position - refCount * 3);
        const refUrl = `https://noctis-racing.com/?ref=${referrer.referral_code}`;

        await sendEmail(
          referrer.email,
          `+3 Plätze vorgerückt — jetzt Platz #${newPosition}`,
          referrerUpdateEmail(newPosition, refCount, refUrl, referrer.referral_code)
        );
      }
    }

    return {
      statusCode: 302,
      headers: { Location: `https://noctis-racing.com/?confirmed=true&code=${entry.referral_code}` },
      body: "",
    };
  } catch (err) {
    console.error("confirm error:", err);
    return {
      statusCode: 302,
      headers: { Location: "https://noctis-racing.com/?error=server_error" },
      body: "",
    };
  }
};
