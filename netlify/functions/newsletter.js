// Función de Netlify: recibe { email } y envía el newsletter con MailerSend.
// Variables de entorno (se configuran en Netlify, NO en el código):
//   MAILERSEND_API_KEY, MAILERSEND_TEMPLATE_ID, MAIL_FROM (correo remitente de tu dominio verificado)
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método no permitido" };
  let email = "";
  try { email = String(JSON.parse(event.body).email || "").trim(); } catch (e) {}
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { statusCode: 400, body: "Correo inválido" };

  const r = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.MAILERSEND_API_KEY
    },
    body: JSON.stringify({
      from: { email: process.env.MAIL_FROM, name: "Tesla" },
      to: [{ email }],
      subject: "Bienvenido a Tesla",
      template_id: process.env.MAILERSEND_TEMPLATE_ID
    })
  });
  return { statusCode: r.ok ? 200 : 502, body: JSON.stringify({ ok: r.ok }) };
};
