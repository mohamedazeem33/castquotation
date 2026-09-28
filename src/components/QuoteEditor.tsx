import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fileToDataUrl } from "@/lib/quote-storage";
import { type ParsedClient } from "@/lib/client-parse";
import { scanCard } from "@/lib/scan-card.functions";
import {
  letters,
  newItem,
  type Quote,
  type Settings,
  type LineItem,
  type TestType,
} from "@/lib/quote-types";

const input =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const btn =
  "inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent";
const card = "rounded-lg border border-border bg-card p-5";

export function Field({
  labelText,
  value,
  onChange,
  rows,
  placeholder,
}: {
  labelText: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <span className={label}>{labelText}</span>
      {rows ? (
        <textarea
          className={input}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={input}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ImagePicker({
  labelText,
  value,
  onChange,
}: {
  labelText: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className={label}>{labelText}</span>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt={labelText} className="h-12 w-auto rounded border border-border" />
        ) : (
          <span className="text-xs text-muted-foreground">No image</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="text-xs text-muted-foreground"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) onChange(await fileToDataUrl(f));
          }}
        />
        {value && (
          <button type="button" className={btn} onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  return (
    <div className="space-y-5">
      <div className={card}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText="Company name" value={settings.companyName} onChange={(v) => set({ companyName: v })} />
          <Field labelText="Tagline" value={settings.tagline} onChange={(v) => set({ tagline: v })} />
          <Field labelText="Address" value={settings.address} onChange={(v) => set({ address: v })} />
          <Field labelText="Contact person" value={settings.contactName} onChange={(v) => set({ contactName: v })} />
          <Field labelText="HP" value={settings.hp} onChange={(v) => set({ hp: v })} />
          <Field labelText="Tel" value={settings.tel} onChange={(v) => set({ tel: v })} />
          <Field labelText="Fax" value={settings.fax} onChange={(v) => set({ fax: v })} />
          <Field labelText="Email" value={settings.email} onChange={(v) => set({ email: v })} />
          <div className="sm:col-span-2">
            <ImagePicker labelText="Logo" value={settings.logo} onChange={(v) => set({ logo: v })} />
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Prepared by</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText="Name" value={settings.preparedByName} onChange={(v) => set({ preparedByName: v })} />
          <Field labelText="Title" value={settings.preparedByTitle} onChange={(v) => set({ preparedByTitle: v })} />
          <Field labelText="Department" value={settings.preparedByDept} onChange={(v) => set({ preparedByDept: v })} />
          <Field
            labelText="Company"
            value={settings.preparedByCompany}
            onChange={(v) => set({ preparedByCompany: v })}
          />
          <div className="sm:col-span-2">
            <ImagePicker
              labelText="Signature / stamp"
              value={settings.signature}
              onChange={(v) => set({ signature: v })}
            />
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="mb-1 text-sm font-semibold text-foreground">Test types</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Presets for the line item dropdown. Picking one fills the description, unit and rate (still editable per quote).
        </p>
        <div className="space-y-3">
          {(settings.testTypes ?? []).map((t, i) => {
            const upd = (patch: Partial<TestType>) => {
              const testTypes = [...settings.testTypes];
              testTypes[i] = { ...t, ...patch };
              set({ testTypes });
            };
            return (
              <div key={t.id} className="rounded-md border border-border p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_120px_100px]">
                  <Field labelText="Name" value={t.name} onChange={(v) => upd({ name: v })} />
                  <Field labelText="Unit" value={t.unit} onChange={(v) => upd({ unit: v })} />
                  <Field labelText="Rate" value={t.rate} onChange={(v) => upd({ rate: v })} />
                </div>
                <div className="mt-3">
                  <Field
                    labelText="Description"
                    rows={2}
                    value={t.description}
                    onChange={(v) => upd({ description: v })}
                  />
                </div>
                <button
                  type="button"
                  className={`${btn} mt-3`}
                  onClick={() => set({ testTypes: settings.testTypes.filter((_, j) => j !== i) })}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className={`${btn} mt-4`}
          onClick={() =>
            set({
              testTypes: [
                ...(settings.testTypes ?? []),
                { id: crypto.randomUUID(), name: "New test type", description: "", unit: "", rate: "" },
              ],
            })
          }
        >
          Add test type
        </button>
      </div>

      <div className={card}>
        <h3 className="mb-1 text-sm font-semibold text-foreground">Terms &amp; conditions</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Edit once — reused on every quote. Use Tab characters for column gaps and Enter for a new line
          inside a clause.
        </p>
        <div className="space-y-3">
          {settings.terms.map((t, i) => (
            <div key={i} className="flex gap-2">
              <span className="w-5 pt-2 text-right text-xs font-semibold text-muted-foreground">{i + 1}</span>
              <textarea
                className={input}
                rows={Math.max(2, t.split("\n").length + 1)}
                value={t}
                onChange={(e) => {
                  const terms = [...settings.terms];
                  terms[i] = e.target.value;
                  set({ terms });
                }}
              />
              <button
                type="button"
                className={btn}
                onClick={() => set({ terms: settings.terms.filter((_, j) => j !== i) })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className={`${btn} mt-4`} onClick={() => set({ terms: [...settings.terms, ""] })}>
          Add clause
        </button>
      </div>
    </div>
  );
}

const FAIL_MSG = "Couldn't read this card, please enter details manually.";

function ClientScanner({ onApply }: { onApply: (p: ParsedClient) => void }) {
  const [raw, setRaw] = useState("");
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const scan = useServerFn(scanCard);

  const run = async (payload: { image?: string; mimeType?: string; text?: string }) => {
    setErr("");
    setBusy(payload.image ? "Reading card…" : "Reading text…");
    try {
      const r = await scan({ data: payload });
      setResponse(r.raw || "");
      if (!r.ok) return setErr(FAIL_MSG);
      const f = r.fields;
      onApply({
        attn: f.designation && f.clientName ? `${f.clientName} (${f.designation})` : f.clientName,
        clientCompany: f.companyName,
        clientEmail: f.email,
        clientPhone: f.phone,
        clientAddress: f.address,
      });
    } catch {
      setErr(FAIL_MSG);
    } finally {
      setBusy("");
    }
  };

  const handleFile = async (f: File) => {
    // Image is only sent for reading — never stored.
    const dataUrl = await fileToDataUrl(f);
    const [head, b64] = dataUrl.split(",");
    const mimeType = head?.match(/data:(.*?);/)?.[1] || f.type || "image/jpeg";
    if (!b64) return setErr(FAIL_MSG);
    await run({ image: b64, mimeType });
  };

  return (
    <div className="mb-4 rounded-md border border-dashed border-input p-4">
      <span className={label}>Scan or paste client details</span>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className={`${btn} cursor-pointer`}>
          Upload business card / ID photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          className={btn}
          disabled={!raw.trim() || !!busy}
          onClick={() => run({ text: raw })}
        >
          Auto-fill from text
        </button>
        {busy && <span className="text-xs text-muted-foreground">{busy}</span>}
      </div>
      <textarea
        className={input}
        rows={4}
        value={raw}
        placeholder="Paste text from WhatsApp or email here, then click Auto-fill."
        onChange={(e) => setRaw(e.target.value)}
      />
      {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
      {response && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">Raw response</summary>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs text-foreground">
            {response}
          </pre>
        </details>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Fields below are filled automatically — check and correct them before saving. Card photos are not stored.
      </p>
    </div>
  );
}

export function QuoteForm({
  quote,
  settings,
  onChange,
}: {
  quote: Quote;
  settings: Settings;
  onChange: (q: Quote) => void;
}) {
  const set = (patch: Partial<Quote>) => onChange({ ...quote, ...patch });
  const setItem = (id: string, patch: Partial<LineItem>) =>
    set({ items: quote.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const testTypes = settings.testTypes ?? [];

  return (
    <div className="space-y-5">
      <div className={card}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Quotation details</h3>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Field labelText="Reference number" value={quote.ref} onChange={(v) => set({ ref: v })} />
          <Field labelText="Date" value={quote.date} onChange={(v) => set({ date: v })} />
        </div>
        <ClientScanner
          onApply={(p) =>
            set({
              attn: p.attn || quote.attn,
              clientCompany: p.clientCompany || quote.clientCompany,
              clientEmail: p.clientEmail || quote.clientEmail,
              clientPhone: p.clientPhone || quote.clientPhone,
              clientAddress: p.clientAddress || quote.clientAddress,
            })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText="Client name (Attention)" value={quote.attn} onChange={(v) => set({ attn: v })} />
          <Field
            labelText="Company name"
            value={quote.clientCompany}
            onChange={(v) => set({ clientCompany: v })}
          />
          <Field labelText="Email" value={quote.clientEmail} onChange={(v) => set({ clientEmail: v })} />
          <Field
            labelText="Phone / ext"
            value={quote.clientPhone}
            onChange={(v) => set({ clientPhone: v })}
          />
          <div className="sm:col-span-2">
            <Field
              labelText="Address"
              rows={2}
              value={quote.clientAddress}
              onChange={(v) => set({ clientAddress: v })}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <Field
            labelText="Project title (scope of work heading)"
            rows={4}
            value={quote.projectTitle}
            onChange={(v) => set({ projectTitle: v })}
          />
          <Field labelText="Intro line" value={quote.introLine} onChange={(v) => set({ introLine: v })} />
        </div>
      </div>

      <div className={card}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Line items</h3>
        <div className="space-y-4">
          {quote.items.map((it, idx) => (
            <div key={it.id} className="rounded-md border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Item {idx + 1}</span>
                <button
                  type="button"
                  className={btn}
                  onClick={() => set({ items: quote.items.filter((x) => x.id !== it.id) })}
                >
                  Remove item
                </button>
              </div>
              <div className="mb-3">
                <span className={label}>Test type</span>
                <select
                  className={input}
                  value={it.testType ?? ""}
                  onChange={(e) => {
                    const t = testTypes.find((x) => x.id === e.target.value);
                    if (!t) return setItem(it.id, { testType: "" });
                    setItem(it.id, {
                      testType: t.id,
                      description: t.description || t.name,
                      rate: t.rate,
                      unit: t.unit || it.unit,
                    });
                  }}
                >
                  <option value="">— Custom / none —</option>
                  {testTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                labelText="Description"
                rows={2}
                value={it.description}
                onChange={(v) => setItem(it.id, { description: v })}
              />
              <div className="mt-3">
                <Field
                  labelText="Sub-notes (one per line)"
                  rows={3}
                  value={it.notes.join("\n")}
                  onChange={(v) => setItem(it.id, { notes: v.split("\n").filter((n) => n.trim() !== "") })}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <Field labelText="Qty" value={it.qty} onChange={(v) => setItem(it.id, { qty: v })} />
                <Field
                  labelText="Unit"
                  value={it.unit}
                  placeholder="Per Trip"
                  onChange={(v) => setItem(it.id, { unit: v })}
                />
                <Field labelText="Rate" value={it.rate} onChange={(v) => setItem(it.id, { rate: v })} />
                <label className="flex items-end gap-2 pb-2 text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={it.rateOnly}
                    onChange={(e) => setItem(it.id, { rateOnly: e.target.checked })}
                  />
                  Show "Rate Only"
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${btn} mt-4`}
          onClick={() => set({ items: [...quote.items, newItem()] })}
        >
          Add row
        </button>
      </div>

      <div className={card}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Facilities to be provided by client</h3>
        <div className="space-y-3">
          {quote.facilities.map((f, i) => (
            <div key={i} className="flex gap-2">
              <span className="w-5 pt-2 text-right text-xs font-semibold text-muted-foreground">
                {letters[i]}
              </span>
              <textarea
                className={input}
                rows={2}
                value={f}
                onChange={(e) => {
                  const facilities = [...quote.facilities];
                  facilities[i] = e.target.value;
                  set({ facilities });
                }}
              />
              <button
                type="button"
                className={btn}
                onClick={() => set({ facilities: quote.facilities.filter((_, j) => j !== i) })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`${btn} mt-4`}
          onClick={() => set({ facilities: [...quote.facilities, ""] })}
        >
          Add condition
        </button>
      </div>
    </div>
  );
}

export function HistoryList({
  quotes,
  onOpen,
  onDelete,
}: {
  quotes: Quote[];
  onOpen: (q: Quote) => void;
  onDelete: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = term
    ? quotes.filter(
        (x) =>
          x.ref.toLowerCase().includes(term) || x.clientCompany.toLowerCase().includes(term),
      )
    : quotes;

  return (
    <div className={card}>
      <h3 className="mb-4 text-sm font-semibold text-foreground">Saved quotations</h3>
      <input
        className={`${input} mb-4`}
        placeholder="Search by reference or client"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{x.ref}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {x.clientCompany || "No client"} · {x.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btn} onClick={() => onOpen(x)}>
                  Open
                </button>
                <button type="button" className={btn} onClick={() => onDelete(x.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
