import { useState } from "react";
import { fileToDataUrl } from "@/lib/quote-storage";
import {
  letters,
  newItem,
  type Quote,
  type Settings,
  type LineItem,
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

export function QuoteForm({
  quote,
  onChange,
}: {
  quote: Quote;
  onChange: (q: Quote) => void;
}) {
  const set = (patch: Partial<Quote>) => onChange({ ...quote, ...patch });
  const setItem = (id: string, patch: Partial<LineItem>) =>
    set({ items: quote.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  return (
    <div className="space-y-5">
      <div className={card}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Quotation details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText="Reference number" value={quote.ref} onChange={(v) => set({ ref: v })} />
          <Field labelText="Date" value={quote.date} onChange={(v) => set({ date: v })} />
          <Field
            labelText="Client company"
            value={quote.clientCompany}
            onChange={(v) => set({ clientCompany: v })}
          />
          <Field
            labelText="Client address"
            rows={2}
            value={quote.clientAddress}
            onChange={(v) => set({ clientAddress: v })}
          />
          <Field labelText="Attention" value={quote.attn} onChange={(v) => set({ attn: v })} />
          <Field labelText="Client email" value={quote.clientEmail} onChange={(v) => set({ clientEmail: v })} />
          <Field
            labelText="Phone / ext"
            value={quote.clientPhone}
            onChange={(v) => set({ clientPhone: v })}
          />
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
