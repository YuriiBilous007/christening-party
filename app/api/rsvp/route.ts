import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { parseReply, type Reply } from "../../../lib/rsvp";
export const dynamic = "force-dynamic";
const configured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
async function notifyByEmail(reply: Reply) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RSVP_NOTIFICATION_FROM;
  const recipients = (process.env.RSVP_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (!apiKey || !from || recipients.length < 1 || recipients.length > 2) {
    console.error(
      "RSVP email notifications require Resend credentials and one or two recipient emails.",
    );
    return false;
  }
  const children = reply.childrenAges.length
    ? reply.childrenAges
        .map((age) => (age === 0 ? "до 1 року" : `${age} р.`))
        .join(", ")
    : "немає";
  const text = [
    "Нова відповідь на запрошення на хрестини Терези",
    `Ім’я: ${reply.name.replace(/[\r\n\t]+/g, " ")}`,
    `Присутність: ${reply.attendance === "yes" ? "будуть" : "не зможуть бути"}`,
    `Дорослих: ${reply.adults}`,
    `Діти: ${children}`,
  ].join("\n");
  const results = await Promise.all(
    recipients.map(async (to) => {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to,
            subject: "Нова відповідь на хрестини Терези",
            text,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok)
          console.error(
            `RSVP email notification failed with status ${response.status}.`,
          );
        return response.ok;
      } catch {
        console.error("RSVP email notification request failed.");
        return false;
      }
    }),
  );
  return results.every(Boolean);
}
function database(path: string, init: RequestInit = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return fetch(
    `${process.env.SUPABASE_URL!.replace(/\/$/, "")}/rest/v1/${path}`,
    {
      ...init,
      cache: "no-store",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: AbortSignal.timeout(10000),
    },
  );
}
export async function GET() {
  if (!configured()) return Response.json({ configured: false, guests: [] });
  try {
    const response = await database(
      "christening_rsvps?attendance=eq.yes&select=name,adults,children_count&order=created_at.asc&limit=1000",
    );
    if (!response.ok) throw new Error("Database unavailable");
    return Response.json(
      { configured: true, guests: await response.json() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Не вдалося завантажити гостей." },
      { status: 503 },
    );
  }
}
export async function POST(request: Request) {
  if (!configured())
    return Response.json(
      { error: "Надсилання ще не підключене." },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  let reply;
  try {
    const text = await request.text();
    if (text.length > 5000)
      return Response.json({ error: "Завелика відповідь." }, { status: 413 });
    reply = parseReply(JSON.parse(text));
  } catch {
    return Response.json(
      { error: "Перевірте ім’я, кількість дорослих та вік дітей." },
      { status: 400 },
    );
  }
  try {
    const jar = await cookies();
    const existing = jar.get("tereza-rsvp-id")?.value;
    const id =
      existing &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        existing,
      )
        ? existing
        : randomUUID();
    const response = await database("christening_rsvps?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id,
        name: reply.name,
        attendance: reply.attendance,
        adults: reply.adults,
        children_count: reply.childrenAges.length,
        children_ages: reply.childrenAges,
      }),
    });
    if (!response.ok) throw new Error("Save failed");
    jar.set("tereza-rsvp-id", id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    const emailNotificationsSent = await notifyByEmail(reply);
    return Response.json({ ok: true, emailNotificationsSent });
  } catch {
    return Response.json(
      { error: "Не вдалося зберегти відповідь. Спробуйте ще раз." },
      { status: 503 },
    );
  }
}
