# Deploying to shared hosting

The site is a static export: 4,160 prerendered pages and nothing that needs a
server to run. Any LiteSpeed or Apache host can serve it. These are the steps
that keep it behaving exactly as it did on Vercel — same URLs, same redirects,
same canonical host.

## Build

```sh
EXPORT_STATIC=1 npm run build   # writes out/
node scripts/make-htaccess.mjs  # writes out/.htaccess
```

`EXPORT_STATIC=1` switches `next.config.ts` to `output: "export"`. Without it
the build behaves as it always has, so a normal `npm run build` is unaffected.

The export cannot do redirects — Next.js excludes them from `output: "export"` —
so `scripts/make-htaccess.mjs` reads the redirect list straight out of
`next.config.ts` and writes the equivalent Apache rules. Run it after every
build, and after any change to the redirects, so the two cannot drift apart.

## Upload

`out/` holds ~26,000 files. Do not upload them one at a time over FTP; it will
take hours and drop connections. Zip the directory, upload the single archive
through the host's File Manager, and extract it server-side into `public_html/`.

Make sure `.htaccess` survives the transfer. File managers hide dotfiles by
default, and an extraction that silently drops it leaves every URL broken.
Confirm it exists in `public_html/` before testing.

## DNS

Point both `oneminuteiman.xyz` and `www.oneminuteiman.xyz` at the host. The
`.htaccess` sends the apex to `www` with a 301, because `lib/site.ts` declares
`www` the canonical host and every canonical tag on the site already says so.
If the apex is left serving pages directly, the whole site exists twice as far
as Google is concerned.

Enable the free SSL certificate before switching DNS, not after. The canonical
rule redirects to `https://`, so without a certificate in place the first
request loops into an error.

## After deploying, check these

The rules below were verified against Apache 2.4 locally — 40 assertions, all
passing — but a host's own configuration can still interfere. Confirm:

- `https://www.oneminuteiman.xyz/` loads
- `https://oneminuteiman.xyz/d/gratitude` → 301 → `https://www.oneminuteiman.xyz/d/gratitude`
- `/d/afflicted` → 301 → `/d/seeing-affliction` (one of the twelve merges)
- `/d/gratitude/` → 301 → `/d/gratitude` (no trailing-slash duplicate)
- `/sitemap.xml` and `/robots.txt` both load
- `/opengraph-image` returns `Content-Type: image/png`
- A nonexistent path returns the site's own 404, not the host's
- `curl -sI -H 'Accept-Encoding: gzip' <url> | grep -i content-encoding` says gzip

That last one matters more than it looks. Compression takes the largest hadith
page from 4.2 MB to 739 KB and the sitemap from 717 KB to 31 KB. If the host
does not honour `AddOutputFilterByType`, enable gzip or brotli in its control
panel instead — LiteSpeed usually has it on by default, but confirm rather
than assume.

## Putting Cloudflare in front

Optional, free, and the thing that stops a crawler surge from ever mattering
again. Cloudflare sits between readers and the host, serves the pages from its
own edge, and the host only sees what Cloudflare could not answer from cache.

Do this **after** the site is confirmed working on the host, never before. If
the origin is not yet serving pages over HTTPS, moving DNS to Cloudflare takes
the domain down rather than speeding it up.

### Order matters

1. Site is live on the host and the checklist above passes
2. The host's SSL certificate is issued and `https://` works **directly on the
   host**, not through anything else
3. Create the Cloudflare account and add `oneminuteiman.xyz`
4. Let Cloudflare import the existing DNS records, then check them against the
   host's records one by one before continuing
5. **Set SSL/TLS mode to Full (strict) before changing nameservers** — see the
   warning below, this is not a step to defer
6. Change the nameservers at the registrar
7. Wait for Cloudflare to report the zone active, then re-run the checklist

### The setting that will take the site down

**SSL/TLS → Overview → Full (strict).**

The default on some accounts is Flexible, which means Cloudflare fetches from
the origin over plain HTTP. The `.htaccess` written by
`scripts/make-htaccess.mjs` redirects any non-HTTPS request to `https://`. Put
those together and every request loops until the browser gives up:
Cloudflare asks over HTTP, the host says "go to HTTPS", Cloudflare asks over
HTTP again. The site is completely unreachable, and the cause is not obvious
from the error.

Full (strict) makes Cloudflare fetch over HTTPS and verify the host's
certificate. The loop cannot form. This is why step 2 above insists the
certificate is working before any of this begins.

### Other settings to get right

- **Speed → Optimization → Rocket Loader: OFF.** It reorders and defers
  scripts, which breaks React hydration. The search box, the saved list and
  the copy buttons all depend on hydration completing normally.
- **Any MX records stay grey-clouded (DNS only).** Proxying mail records
  breaks mail delivery for the domain.
- **Leave Bot Fight Mode off** unless there is a reason to turn it on. It can
  serve challenges to crawlers, and the entire point of this site's SEO work
  is to be crawled. Cloudflare already allows verified bots by default.
- **Add a Cache Rule for HTML.** Cloudflare caches CSS, JS and images by
  default but *not* HTML, and HTML is where this site's weight lives. Without
  a rule the host still absorbs most page requests. Cache by `Host` matching
  the site, with edge TTL an hour or so; purge after a redeploy.

### Nameservers, not a CNAME

Cloudflare's free plan takes over DNS for the whole domain, so the
nameservers change at the registrar. Propagation runs a few hours, during
which some readers resolve via the old nameservers and some via the new. Both
answer correctly as long as the host is already serving the site, which is
what step 1 guarantees.

## What LiteSpeed does differently

Verified against the live ExonHost server, not just a local Apache.

LiteSpeed does not honour a standalone passthrough rule the way Apache does:

```apache
RewriteRule ^\.well-known/ - [L]    # works on Apache, ignored by LiteSpeed
```

On Apache this exempts ACME challenges from the canonical redirect. On
LiteSpeed the challenge was still redirected to https, which would have meant
no certificate could ever be issued — and because the same config forces
https, the site would then have been permanently unreachable. The failure
looks nothing like its cause.

`scripts/make-htaccess.mjs` therefore attaches the exclusion to each redirect
rule as its own condition:

```apache
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://www.oneminuteiman.xyz/$1 [R=301,L]
```

Confirmed by writing a real token into `.well-known/acme-challenge/` and
fetching it over plain HTTP: served `200` with its contents, no redirect.

Note that a *nonexistent* path under `.well-known` still returns 301 on this
host. That does not affect issuance, since Let's Encrypt only ever requests a
token it has just created, but it is unexplained rather than understood.

The lesson generalises: test rewrite rules against the server that will run
them. A local Apache agreeing with you proves less than it appears to.

## Then tell Google

Submit `https://www.oneminuteiman.xyz/sitemap.xml` in Search Console once the
site answers on the new host, and check Coverage a few days later. After an
outage the priority is getting 4,160 URLs crawled as healthy again.

## Page weight

`/hadith/<collection>/<book>` used to render every narration in a book on one
page — 921 of them on the largest, 5.6 MB of markup. It is now served 80 at a
time; `/hadith/x/y` is still page one, so nothing that was linked or indexed
moved. Ninety-five pages were over a megabyte; one is.

That was left undone for a real reason, which had to be answered first:
`BookFilter` searches the narrations already in the DOM, so a paginated book
would filter one page while appearing to search the whole book. It now says
which page it is reading and links to the corpus-wide search with the words
already typed, so the narrowing is never silent.

Two other things used to travel with every page and no longer do:

- **Ibn Kathīr.** The commentary was written into each sūrah page inside
  collapsed `<details>` — 1.2 MB of it on al-Baqarah, downloaded by everyone,
  opened by almost nobody. The headings still render on the server; the text is
  fetched from `/tafsir/<surah>.json` when a section is opened.
- **Two index files in the JavaScript bundle.** `quran-index.json` is 1 MB, of
  which the matcher wanted 2 KB of sūrah names, and `index.json` is 0.9 MB of
  entries that the search box never reads. Both were in the bundle of every
  page. The names are split into `quran-names.json`, the entries into
  `lib/corpus.ts`, and the āyāt index is fetched by `/quran`'s search box on the
  first keystroke. First-load JavaScript went from 1.67 MB to 706 KB.

`node scripts/derive.mjs` and `node scripts/publish-tafsir.mjs` produce the
split files. They are listed in `scripts/README.md` with the rest of the
pipeline and must be re-run whenever `data/` changes, or a page will show text
that no longer matches its source.

## New generated assets

Three directories under `public/` are build output, not hand-written, and have
to reach the server with everything else:

| Path | Size | What it is |
|---|---|---|
| `public/hsearch/` | 16 MB, 826 files | the sharded index behind the hadith search |
| `public/tafsir/` | 12 MB, 114 files | Ibn Kathīr, fetched per sūrah on demand |
| `public/quran-index.json` | 1 MB | every āyah, fetched by `/quran`'s search |

A deploy that omits them leaves the hadith search answering nothing and every
commentary section stuck on "Loading the commentary…".
