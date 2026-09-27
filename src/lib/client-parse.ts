export type ParsedClient = {
  attn: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
};

const COMPANY_RE =
  /\b(pte\.?\s*ltd|pvt\.?\s*ltd|sdn\.?\s*bhd|ltd|limited|llp|llc|inc|corp(oration)?|co\.|company|holdings|group|engineering|construction|contractors?|builders?|consultants?|enterprise|industries|services|technologies|solutions)\b/i;
const ADDRESS_RE =
  /\b(road|rd|street|st|avenue|ave|drive|dr|lane|ln|crescent|cres|link|way|boulevard|blvd|jalan|lorong|block|blk|level|unit|#\d|tower|building|bldg|industrial|park|centre|center|singapore|s\(?\d{6}\)?)\b|\b\d{6}\b|#\d+-\d+/i;
const TITLE_RE =
  /\b(manager|director|engineer|executive|officer|supervisor|coordinator|ceo|cto|cfo|founder|president|head|lead|assistant|consultant|specialist|architect|surveyor|qs)\b/i;
const LABEL_RE = /^(name|attn|attention|contact|company|email|e-mail|tel|phone|hp|mobile|mob|address|addr|fax|web|website)\s*[:.-]\s*/i;

export function parseClientText(raw: string): ParsedClient {
  const out: ParsedClient = { attn: "", clientCompany: "", clientEmail: "", clientPhone: "", clientAddress: "" };
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const used = new Set<number>();

  // Labeled lines first ("Email: x", "Company: y")
  lines.forEach((l, i) => {
    const m = l.match(LABEL_RE);
    if (!m) return;
    const key = m[1].toLowerCase();
    const val = l.slice(m[0].length).trim();
    if (!val) return;
    if (["name", "attn", "attention", "contact"].includes(key) && !out.attn) out.attn = val;
    else if (key === "company" && !out.clientCompany) out.clientCompany = val;
    else if (["address", "addr"].includes(key) && !out.clientAddress) out.clientAddress = val;
    else return;
    used.add(i);
  });

  const emailM = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailM) out.clientEmail = emailM[0];

  const phones = raw.match(/(\+?\d[\d\s()-]{6,}\d)(\s*(ext|x)\.?\s*\d+)?/gi) || [];
  const cleanPhones = phones
    .map((p) => p.trim())
    .filter((p) => {
      const d = p.replace(/\D/g, "");
      return d.length >= 7 && d.length <= 15 && !/^\d{6}$/.test(d);
    });
  // Prefer lines labeled mobile/hp
  const mobileLine = lines.find((l) => /\b(hp|mobile|mob|cell|m)\b\s*[:.]/i.test(l));
  const mobile = mobileLine?.match(/(\+?\d[\d\s()-]{6,}\d)/)?.[0];
  out.clientPhone = (mobile ?? cleanPhones[0] ?? "").trim();

  lines.forEach((l, i) => {
    if (emailM && l.includes(emailM[0])) used.add(i);
    if (/^(tel|phone|hp|mobile|mob|fax|t|m|f)\b/i.test(l) || (cleanPhones.some((p) => l.includes(p)) && l.replace(/[^a-z]/gi, "").length < 12)) used.add(i);
    if (/(www\.|https?:\/\/)/i.test(l)) used.add(i);
  });

  if (!out.clientCompany) {
    const i = lines.findIndex((l, j) => !used.has(j) && COMPANY_RE.test(l));
    if (i >= 0) { out.clientCompany = lines[i]; used.add(i); }
  }

  if (!out.clientAddress) {
    const addr: string[] = [];
    lines.forEach((l, i) => {
      if (!used.has(i) && ADDRESS_RE.test(l)) { addr.push(l); used.add(i); }
    });
    out.clientAddress = addr.join("\n");
  }

  if (!out.attn) {
    const i = lines.findIndex(
      (l, j) =>
        !used.has(j) &&
        !TITLE_RE.test(l) &&
        /^[A-Za-z][A-Za-z .'()-]{1,40}$/.test(l) &&
        l.split(" ").length <= 5,
    );
    if (i >= 0) { out.attn = lines[i]; used.add(i); }
  }
  return out;
}

export async function ocrImage(file: File, onProgress?: (p: number) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onProgress?.(m.progress);
    },
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
