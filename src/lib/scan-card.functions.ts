import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "gemini-2.5-flash";

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
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false as const, raw: "", error: "AI key missing" };

    const parts: unknown[] = [{ text: PROMPT }];
    if (data.image) {
      parts.push({
        inline_data: { mime_type: data.mimeType || "image/jpeg", data: data.image },
      });
    } else if (data.text?.trim()) {
      parts.push({ text: Text:\n${data.text} });
    } else return { ok: false as const, raw: "", error: "Nothing to read" };

    try {
      const res = await fetch(
        https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: { responseMimeType: "application/json", temperature: 0 },
          }),
        },
      );
      if (!res.ok) {
        return { ok: false as const, raw: await res.text().catch(() => ""), error: HTTP ${res.status} };
      }
      const json = await res.json();
      const out: string = ((json.candidates?.[0]?.content?.parts ?? []) as { text?: string }[])
        .map((p) => p.text ?? "")
        .join("");
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
