import { amountOf, letters, totalsOf, type Quote, type Settings } from "@/lib/quote-types";

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <div className="doc-footer">
      <span>CAST Laboratories PL 17 Tuas Avenue 8 S639232</span>
      <span>
        {page} of {total}
      </span>
    </div>
  );
}

function Letterhead({ settings }: { settings: Settings }) {
  return (
    <div className="doc-head-right">
      {settings.logo ? (
        <img src={settings.logo} alt={settings.companyName} className="doc-logo" />
      ) : (
        <div className="doc-logo-placeholder">{settings.companyName}</div>
      )}
      <div className="doc-tagline">{settings.tagline}</div>
      <div className="doc-contact">
        <div>
          {settings.contactName} HP: {settings.hp}
        </div>
        <div>
          Tel: {settings.tel} Fax: {settings.fax}
        </div>
        <div>Email: {settings.email}</div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 12;

export function QuoteDocument({ quote, settings }: { quote: Quote; settings: Settings }) {
  const chunks: { start: number; items: Quote["items"] }[] = [];
  for (let i = 0; i < Math.max(quote.items.length, 1); i += ITEMS_PER_PAGE) {
    chunks.push({ start: i, items: quote.items.slice(i, i + ITEMS_PER_PAGE) });
  }
  const totalPages = chunks.length + 1;

  return (
    <div className="doc-root">
      {chunks.map((chunk, ci) => {
        const isFirst = ci === 0;
        const isLast = ci === chunks.length - 1;
        return (
          <section key={ci} className="doc-page">
            <div className="doc-page-body">
              {isFirst ? (
                <>
                  <div className="doc-top">
                    <div className="doc-head-left">
                      <div className="doc-ref">
                        <span className="doc-label">Ref:</span> {quote.ref}
                      </div>
                      <div className="doc-date">{quote.date}</div>
                    </div>
                    <Letterhead settings={settings} />
                  </div>

                  <div className="doc-client">
                    <div className="doc-client-name">{quote.clientCompany}</div>
                    {quote.clientAddress.split("\n").map((l, i) => (
                      <div key={i} className="doc-client-name">
                        {l}
                      </div>
                    ))}
                  </div>

                  <div className="doc-attn">
                    <div>
                      <span className="doc-label">Attn:</span> {quote.attn}
                    </div>
                    {quote.clientEmail && (
                      <div>
                        <span className="doc-label">Email:</span>{" "}
                        <span className="doc-link">{quote.clientEmail}</span>
                      </div>
                    )}
                    {quote.clientPhone && (
                      <div>
                        <span className="doc-label">TEL:</span> {quote.clientPhone}
                      </div>
                    )}
                  </div>

                  <h1 className="doc-title">{quote.projectTitle}</h1>

                  <p className="doc-intro">{quote.introLine}</p>
                </>
              ) : (
                <div className="doc-head-left doc-cont-head">
                  <div className="doc-ref">
                    <span className="doc-label">Ref:</span> {quote.ref}
                  </div>
                  <div className="doc-date">{quote.date}</div>
                </div>
              )}

              <table className="doc-table">
                <thead>
                  <tr>
                    <th className="w-no">No</th>
                    <th>Description</th>
                    <th className="w-qty">Qty</th>
                    <th className="w-unit">Unit</th>
                    <th className="w-rate">Rate</th>
                    <th className="w-amt">Amount S$</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="ta-c">{chunk.start + idx + 1}</td>
                      <td>
                        <div className="doc-item-desc">{it.description}</div>
                        {it.notes.length > 0 && (
                          <div className="doc-item-notes">
                            <div className="doc-notes-label">Notes:</div>
                            {it.notes.map((n, i) => (
                              <div key={i}>{n}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="ta-c">{it.qty}</td>
                      <td className="ta-c">{it.unit}</td>
                      <td className="ta-c">{it.rate}</td>
                      <td className="ta-c">{amountOf(it)}</td>
                    </tr>
                  ))}
                  {isLast &&
                    (() => {
                      const t = totalsOf(quote);
                      const rows: [string, string][] = [];
                      if (t.subtotal) rows.push(["Subtotal", t.subtotal.toFixed(2)]);
                      if (t.discount) rows.push(["Discount", `-${t.discount.toFixed(2)}`]);
                      if (t.gstPct && t.gst) rows.push([`GST ${t.gstPct}%`, t.gst.toFixed(2)]);
                      if (t.subtotal) rows.push(["Overall Total", t.total.toFixed(2)]);
                      return rows.map(([label, val], i) => (
                        <tr key={label} className={i === rows.length - 1 ? "doc-total-final" : "doc-total-row"}>
                          <td colSpan={5} className="ta-r doc-total-label">{label}</td>
                          <td className="ta-c">{val}</td>
                        </tr>
                      ));
                    })()}
                  {isLast && (
                    <tr>
                      <td colSpan={6} className="doc-facilities">
                        <div className="doc-notes-label">Notes:</div>
                        <div className="doc-facilities-label">Facilities to be provided by client</div>
                        <table className="doc-facilities-list">
                          <tbody>
                            {quote.facilities.map((f, i) => (
                              <tr key={i}>
                                <td className="doc-letter">{letters[i]}</td>
                                <td>{f}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Footer page={ci + 1} total={totalPages} />
          </section>
        );
      })}

      {/* ---------- Terms page ---------- */}
      <section className="doc-page">
        <div className="doc-page-body">
          <div className="doc-head-left">
            <div className="doc-ref">
              <span className="doc-label">Ref:</span> {quote.ref}
            </div>
            <div className="doc-date">{quote.date}</div>
          </div>
          <div className="doc-p2-logo">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.companyName} className="doc-logo" />
            ) : null}
            <div className="doc-tagline">{settings.tagline}</div>
          </div>

          <h2 className="doc-terms-heading">TERMS &amp; CONDITIONS</h2>
          <table className="doc-terms">
            <tbody>
              {settings.terms.map((t, i) => (
                <tr key={i}>
                  <td className="doc-term-no">{i + 1}</td>
                  <td className="doc-term-text">
                    {t.split("\n").map((line, li) => (
                      <div key={li} className="doc-term-line">
                        {line.split("\t").map((seg, si) => (
                          <span key={si} className={si > 0 ? "doc-term-tab" : undefined}>
                            {seg}
                          </span>
                        ))}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="doc-sign">
            <tbody>
              <tr>
                <th>Prepared By:</th>
                <th>Accepted By:</th>
              </tr>
              <tr>
                <td className="doc-sign-box">
                  {settings.signature ? (
                    <img src={settings.signature} alt="Signature and stamp" className="doc-stamp" />
                  ) : null}
                </td>
                <td className="doc-sign-box" />
              </tr>
              <tr>
                <td className="doc-sign-meta">
                  <div>{settings.preparedByName}</div>
                  <div>{settings.preparedByTitle}</div>
                  <div>{settings.preparedByDept}</div>
                  <div>{settings.preparedByCompany}</div>
                </td>
                <td className="doc-sign-meta">
                  <div>Name:</div>
                  <div>Designation:</div>
                  <div>Date:</div>
                  <div>Company's Stamp:</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Footer page={2} />
      </section>
    </div>
  );
}
