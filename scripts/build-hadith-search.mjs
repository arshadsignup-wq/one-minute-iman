/**
 * A search index for the whole hadith corpus.
 *
 * 43,551 narrations were reachable only by picking a collection, then a book,
 * then reading. People do not arrive knowing the book; they arrive with "that
 * hadith about smiling". The corpus is 47MB, so it cannot be shipped to the
 * browser, and a server is not available: the site is a static export.
 *
 * So the index is sharded, and a query fetches only the shards it needs:
 *
 *   hsearch/meta.json   collection names, shard sizes
 *   hsearch/t/<0..63>   term -> doc ids, bucketed by a hash of the term
 *   hsearch/d/<k>       64 doc records each: collection, book, number, grade,
 *                       and enough English to recognise the narration
 *
 * A two-word query reads two term shards (~60KB) and one doc shard per handful
 * of results (~40KB). Nothing is loaded until someone actually searches.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "hsearch");
const BUCKETS = 128;
const SHARD = 64;
const SNIPPET = 180;

/** Words that are in almost every narration, and carry nothing. */
const STOP = new Set(
  ("the a an and or of to in is was were be been being that this it he she they we you i his her "
   + "their our your my me him them who whom which what when where how why not no nor but if then "
   + "than so as at by for from with without on off up down out over under again further once here "
   + "there all any both each few more most other some such only own same too very can will just "
   + "should now said says say narrated allah messenger prophet pbuh peace upon him has have had "
   + "would could may might one two also about after before").split(" "),
);

const books = JSON.parse(readFileSync(join(root, "data/hadith-books.json"), "utf8")).collections;
const slugs = Object.keys(books);

function terms(text) {
  const seen = new Set();
  for (const raw of (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
    if (raw.length < 3 || raw.length > 20 || STOP.has(raw)) continue;
    seen.add(raw);
  }
  return seen;
}

/** Must match hashTerm() in components/HadithSearch.tsx. */
function bucketOf(term) {
  let h = 5381;
  for (let i = 0; i < term.length; i++) h = ((h * 33) ^ term.charCodeAt(i)) >>> 0;
  return h % BUCKETS;
}

const docs = [];
const index = new Map();
// "bukhari 6345" is a search too, and the commonest one people arrive with.
// Which book a number lives in is the only thing a reference lookup needs, and
// it is one small file per collection, fetched only for that kind of query.
const refs = Object.fromEntries(slugs.map((s) => [s, {}]));

for (const [slug, c] of Object.entries(books)) {
  const ci = slugs.indexOf(slug);
  for (const b of c.books) {
    const file = join(root, "data/hadith", slug, `${b.n}.json`);
    if (!existsSync(file)) continue;
    for (const h of JSON.parse(readFileSync(file, "utf8"))) {
      const id = docs.length;
      const en = (h.en || "").replace(/\s+/g, " ").trim();
      docs.push([ci, h.b, h.n, h.g || "", en.length > SNIPPET ? en.slice(0, SNIPPET).trimEnd() + "…" : en]);
      refs[slug][h.n] = h.b;
      for (const t of terms(en)) {
        let list = index.get(t);
        if (!list) index.set(t, (list = []));
        list.push(id);
      }
    }
  }
}

// A word in one narration in twelve is not a search term, it is background.
// Which words those are has to travel with the index: the browser cannot tell
// "too common to be worth indexing" from "appears nowhere", and reporting the
// first as the second tells someone searching for "the deeds are by intentions"
// that no narration contains the word "are".
const ceiling = docs.length * 0.08;
const common = [];
for (const [t, list] of index) {
  if (list.length > ceiling) { common.push(t); index.delete(t); }
}
common.sort();

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "t"), { recursive: true });
mkdirSync(join(out, "d"), { recursive: true });

const buckets = Array.from({ length: BUCKETS }, () => ({}));
for (const [t, list] of index) buckets[bucketOf(t)][t] = list;
let termBytes = 0;
buckets.forEach((b, i) => {
  const s = JSON.stringify(b);
  termBytes += s.length;
  writeFileSync(join(out, "t", `${i}.json`), s);
});

let docBytes = 0;
for (let k = 0; k * SHARD < docs.length; k++) {
  const s = JSON.stringify(docs.slice(k * SHARD, (k + 1) * SHARD));
  docBytes += s.length;
  writeFileSync(join(out, "d", `${k}.json`), s);
}

mkdirSync(join(out, "r"), { recursive: true });
let refBytes = 0;
for (const slug of slugs) {
  const s = JSON.stringify(refs[slug]);
  refBytes += s.length;
  writeFileSync(join(out, "r", `${slug}.json`), s);
}

writeFileSync(join(out, "meta.json"), JSON.stringify({
  common,
  buckets: BUCKETS,
  shard: SHARD,
  docs: docs.length,
  collections: slugs.map((s) => ({ slug: s, name: books[s].name, graded: !!books[s].graded })),
}));

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;
console.log(`✅ ${docs.length.toLocaleString()} narrations indexed`);
console.log(`   ${index.size.toLocaleString()} terms in ${BUCKETS} shards  ${mb(termBytes)} total, ~${Math.round(termBytes / BUCKETS / 1024)}KB each`);
console.log(`   ${Math.ceil(docs.length / SHARD)} doc shards  ${mb(docBytes)} total, ~${Math.round(docBytes / Math.ceil(docs.length / SHARD) / 1024)}KB each`);
console.log(`   ${slugs.length} reference maps  ${mb(refBytes)} total`);
console.log(`   ${common.length} words too common to index: ${common.slice(0, 12).join(", ")}${common.length > 12 ? " …" : ""}`);
