// Función de Netlify: recibe { email } y envía el newsletter con MailerSend.
// Variables de entorno: MAILERSEND_API_KEY, MAILERSEND_TEMPLATE_ID, MAIL_FROM
const res = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return res(405, { error: "método no permitido" });
  let email = "";
  try { email = String(JSON.parse(event.body).email || "").trim(); } catch (e) {}
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res(400, { error: "correo inválido" });

  const { MAILERSEND_API_KEY, MAILERSEND_TEMPLATE_ID, MAIL_FROM } = process.env;
  const faltan = ["MAILERSEND_API_KEY", "MAILERSEND_TEMPLATE_ID", "MAIL_FROM"].filter(k => !process.env[k]);
  if (faltan.length) return res(500, { error: "faltan variables: " + faltan.join(", ") });

  try {
    const r = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + MAILERSEND_API_KEY.trim() },
      body: JSON.stringify({
        from: { email: MAIL_FROM.trim(), name: "Tesla" },
        to: [{ email }],
        subject: "Bienvenido a Tesla",
        template_id: MAILERSEND_TEMPLATE_ID.trim()
      })
    });
    if (r.ok) return res(200, { ok: true });
    const txt = await r.text();
    console.log("MailerSend", r.status, txt);
    let msg = txt;
    try { msg = JSON.parse(txt).message || txt; } catch (e) {}
    return res(502, { error: "MailerSend " + r.status + ": " + String(msg).slice(0, 200) });
  } catch (e) {
    console.log("Error", e);
    return res(500, { error: "error de red con MailerSend" });
  }
};
