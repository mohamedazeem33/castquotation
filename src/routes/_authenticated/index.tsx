
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QuoteDocument } from "@/components/QuoteDocument";
import {
  HistoryList,
  QuoteForm,
  SettingsPanel,
} from "@/components/QuoteEditor";
import {
  loadQuotes,
  loadSettings,
  saveQuotes,
  saveSettings,
} from "@/lib/quote-storage";
import {
  DEFAULT_SETTINGS,
  emptyQuote,
  type Quote,
  type Settings,
} from "@/lib/quote-types";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      {
        title: "CAST Quotation Builder — Testing & Inspection Quotes",
      },
      {
        name: "description",
        content:
          "Create, save and export formal CAST Laboratories quotations with fixed terms, line items and a print-ready two-page layout.",
      },
      {
        property: "og:title",
        content: "CAST Quotation Builder",
      },
      {
        property: "og:description",
        content:
          "Build print-ready testing and inspection quotations with saved company details, terms and quotation history.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: QuoteBuilder,
});

function bumpRef(ref: string): string {
  const m = ref.match(/^(.*?)(R(\d+))?$/);

  if (!m) {
    return ref;
  }

  const base = m[1] ?? ref;
  const n = m[3] ? parseInt(m[3], 10) + 1 : 1;

  return `${base}R${n}`;
}

const tabBtn = (active: boolean) =>
  `flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors md:flex-none ${
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  }`;

const action =
  "inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto";

const actionAlt =
  "inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:w-auto";

type Tab = "quote" | "settings" | "history";

function QuoteBuilder() {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quote, setQuote] = useState<Quote>(() =>
    emptyQuote(DEFAULT_SETTINGS.lastRef),
  );
  const [tab, setTab] = useState<Tab>("quote");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const s = loadSettings();

    setSettings(s);
    setQuotes(loadQuotes());
    setQuote(emptyQuote(s.lastRef, s.lastGst ?? "9"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      saveSettings(settings);
    }
  }, [settings, ready]);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const handleSave = () => {
    const stamped = {
      ...quote,
      savedAt: new Date().toISOString(),
    };

    const next = [
      stamped,
      ...quotes.filter((q) => q.id !== stamped.id),
    ];

    setQuotes(next);
    saveQuotes(next);
    setQuote(stamped);

    setSettings((s) => ({
      ...s,
      lastRef: stamped.ref,
      lastGst: stamped.gstPercent ?? s.lastGst ?? "9",
    }));

    flash(`Saved ${stamped.ref}`);
  };

  const handleNew = () => {
    setQuote(emptyQuote(bumpRef(settings.lastRef), settings.lastGst ?? "9"));
    setTab("quote");
    flash("New quotation started");
  };

  const handleDuplicateLast = () => {
    const last = quotes[0];

    if (!last) {
      flash("No saved quotation to duplicate yet");
      return;
    }

    setQuote({
      ...last,
      id: crypto.randomUUID(),
      ref: bumpRef(last.ref),
      clientCompany: "",
      clientAddress: "",
      attn: "",
      clientEmail: "",
      clientPhone: "",
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      items: last.items.map((it) => ({
        ...it,
        id: crypto.randomUUID(),
      })),
      facilities: [...last.facilities],
      gstPercent: settings.lastGst ?? last.gstPercent ?? "9",
      savedAt: new Date().toISOString(),
    });

    setTab("quote");
    flash("Copied the last quotation — add the new client details");
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @media screen and (max-width: 767px) {
          .quote-preview {
            zoom: 0.42;
          }
        }
      `}</style>

      <header className="no-print z-10 border-b border-border bg-card md:sticky md:top-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Quotation Builder
            </h1>

            <p className="text-xs text-muted-foreground">
              {settings.companyName}
            </p>
          </div>

          <nav className="flex w-full gap-1 md:w-auto">
            <button
              className={tabBtn(tab === "quote")}
              onClick={() => setTab("quote")}
            >
              Quotation
            </button>

            <button
              className={tabBtn(tab === "settings")}
              onClick={() => setTab("settings")}
            >
              Settings
            </button>

            <button
              className={tabBtn(tab === "history")}
              onClick={() => setTab("history")}
            >
              History ({quotes.length})
            </button>
          </nav>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <button
              className={actionAlt}
              onClick={handleNew}
            >
              New
            </button>

            <button
              className={actionAlt}
              onClick={handleDuplicateLast}
            >
              Duplicate last quote
            </button>

            <button
              className={actionAlt}
              onClick={handleSave}
            >
              Save quotation
            </button>

            <button
              className={action}
              onClick={() => window.print()}
            >
              Download PDF
            </button>
          </div>
        </div>

        {status && (
          <div className="border-t border-border bg-accent px-3 py-1.5 text-xs text-accent-foreground sm:px-6">
            {status}
          </div>
        )}
      </header>

      <main className="quote-workspace mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        <div className="quote-workspace-grid grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-8">
          <div className="no-print min-w-0">
            {tab === "quote" && (
              <QuoteForm
                quote={quote}
                settings={settings}
                onChange={setQuote}
              />
            )}

            {tab === "settings" && (
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
              />
            )}

            {tab === "history" && (
              <HistoryList
                quotes={quotes}
                onOpen={(q) => {
                  setQuote(q);
                  setTab("quote");
                }}
                onDelete={(id) => {
                  const next = quotes.filter((q) => q.id !== id);
                  setQuotes(next);
                  saveQuotes(next);
                }}
              />
            )}
          </div>

          <div className="quote-preview min-w-0 overflow-x-auto">
            <QuoteDocument
              quote={quote}
              settings={settings}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

