<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Quotation app
- Quotation data and company settings live in browser localStorage via src/lib/quote-storage.ts (personal-use app, no backend by design).
- The printable document is a single component (src/components/QuoteDocument.tsx) with a print-only full-width workspace and A4 content-area sizing in src/styles.css so window.print() stays at two pages despite the narrower screen preview.
