import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3.5-flash";

const PROMPT = `Extract contact details from this business card, ID card, or pasted text.
Return ONLY a JSON object with exactly these string keys:
clientName, designation, companyName, email, phone, website, address.
Rules:
- Ignore taglines, slogans, mottos and marketing text.
- Use an empty string for anything not present. Never invent or guess values.
- For ID cards: extract only name and contact details. NEVER return ID/NRIC/passport numbers, date of birth, or other identity data.
- phone: the main mobile/phone number as printed.
- address: full postal address on one or more lines.
No markdown, no explanation — just the JSON.`;

export const scanCard = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ image: z.string().optional(), mimeType: z.string().optional(), text: z.string().optional() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, raw: "", error: "AI key missing" };

    const content: unknown[] = [{ type: "text", text: PROMPT }];
    if (data.image) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${data.mimeType || "image/jpeg"};base64,${data.image}` },
      });
    } else if (data.text?.trim()) {
      content.push({ type: "text", text: `Text:\n${data.text}` });
    } else return { ok: false as const, raw: "", error: "Nothing to read" };

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: MODEL,
          stream: true,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content }],
        }),
      });
      if (!res.ok || !res.body) {
        return { ok: false as const, raw: await res.text().catch(() => ""), error: `HTTP ${res.status}` };
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let out = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const l of lines) {
          const s = l.trim();
          if (!s.startsWith("data:")) continue;
          const p = s.slice(5).trim();
          if (p === "[DONE]") continue;
          try {
            out += JSON.parse(p).choices?.[0]?.delta?.content ?? "";
          } catch {
            /* partial */
          }
        }
      }
      const m = out.match(/\{[\s\S]*\}/);
      if (!m) return { ok: false as const, raw: out, error: "No JSON" };
      const j = JSON.parse(m[0]) as Record<string, unknown>;
      const f = (k: string) => (typeof j[k] === "string" ? (j[k] as string).trim() : "");
      const fields = {
        clientName: f("clientName"),
        designation: f("designation"),
        companyName: f("companyName"),
        email: f("email"),
        phone: f("phone"),
        website: f("website"),
        address: f("address"),
      };
      if (!Object.values(fields).some(Boolean)) return { ok: false as const, raw: out, error: "Empty" };
      return { ok: true as const, raw: out, fields };
    } catch (e) {
      return { ok: false as const, raw: "", error: String(e) };
    }
  });
