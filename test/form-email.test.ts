import { NextRequest } from "next/server";
import { POST as enquiry } from "../src/app/api/enquiry/route";

const sent: any[] = [];
let failSend = false;
(globalThis as any).fetch = async (url: string, init: any) => {
  sent.push({ url, headers: init.headers, body: JSON.parse(init.body) });
  return new Response(failSend ? "boom" : "{}", { status: failSend ? 500 : 200 });
};

const req = (body: any, ip = "1.1.1.1") =>
  new NextRequest("http://localhost/api/enquiry", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json", "x-forwarded-for": ip } });

let failures = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) failures++; };

(async () => {
  // 1. Not configured -> error, nothing silently dropped
  delete process.env.RESEND_API_KEY;
  let r = await enquiry(req({ type: "contact", name: "A", email: "a@b.com", message: "hi" }, "9.9.9.1"));
  check("unconfigured email returns 502", r.status === 502);

  process.env.RESEND_API_KEY = "re_test";
  process.env.FORM_FROM_EMAIL = "VIA Scent <noreply@vialk.com>";

  // 2. Contact happy path + HTML escaping + header-injection-safe subject
  r = await enquiry(req({ type: "contact", name: "Eve\r\nBcc: x@evil.com", email: "Eve@Example.com", subject: "Retail", message: "<script>alert(1)</script>" }, "9.9.9.2"));
  const c = sent.at(-1).body;
  check("contact returns 200", r.status === 200);
  check("sent to info@vialk.com", JSON.stringify(c.to) === '["info@vialk.com"]');
  check("reply_to is customer", c.reply_to === "eve@example.com");
  check("subject has no newlines", !/[\r\n]/.test(c.subject));
  check("message HTML-escaped", c.html.includes("&lt;script&gt;") && !c.html.includes("<script>"));
  check("api key sent as bearer", sent.at(-1).headers.Authorization === "Bearer re_test");

  // 3. Quote happy path
  r = await enquiry(req({ type: "quote", fullName: "Nimal", companyName: "Hotel X", businessEmail: "n@hotelx.lk", phoneNumber: "077", industry: "Resorts", servicesOfInterest: ["HVAC Central Duct Scenting"], privacyConsent: true }, "9.9.9.3"));
  check("quote returns 200", r.status === 200 && sent.at(-1).body.subject.includes("Hotel X"));

  // 4. Validation
  r = await enquiry(req({ type: "quote", fullName: "N", companyName: "H", businessEmail: "n@h.lk", phoneNumber: "1", industry: "x", privacyConsent: false }, "9.9.9.4"));
  check("quote without consent rejected", r.status === 400);
  r = await enquiry(req({ type: "contact", name: "A", email: "not-an-email", message: "hi" }, "9.9.9.5"));
  check("bad email rejected", r.status === 400);

  // 5. Honeypot: pretend success, send nothing
  const before = sent.length;
  r = await enquiry(req({ type: "contact", name: "Bot", email: "b@b.com", message: "spam", website: "http://spam" }, "9.9.9.6"));
  check("honeypot silently dropped", r.status === 200 && sent.length === before);

  // 6. Provider failure surfaces to user
  failSend = true;
  r = await enquiry(req({ type: "contact", name: "A", email: "a@b.com", message: "hi" }, "9.9.9.7"));
  check("provider error returns 502", r.status === 502);
  failSend = false;

  // 7. Rate limit
  let last = 200;
  for (let i = 0; i < 7; i++) last = (await enquiry(req({ type: "contact", name: "A", email: "a@b.com", message: "hi" }, "8.8.8.8"))).status;
  check("rate limit kicks in", last === 429);

  console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
  process.exit(failures ? 1 : 0);
})();
