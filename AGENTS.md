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
- Quotations and shared settings (single row id=1) live in Lovable Cloud tables via src/lib/quote-storage.ts, readable/writable only by signed-in users; accounts are created manually (no sign-up page).
- The app lives under src/routes/_authenticated/ with /auth as the only public page, so nothing loads before login.
- The printable document is a single component (src/components/QuoteDocument.tsx) with a print-only full-width workspace and A4 content-area sizing in src/styles.css ; items are chunked 12 per page with repeated headers, and the terms page always comes last, so page count grows with item count.
