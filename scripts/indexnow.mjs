// After a production build on Vercel, tell Bing (and other IndexNow engines) which pages exist,
// so new or changed pages are crawled within days. Never fails the build.
const KEY = "39aedd834eac5ca2ef6a5c3c83786e99"; // matches public/<KEY>.txt
const HOST = "portfolio.dastrings.name.ng";
const PATHS = ["/", "/work/strings-automation", "/work/verifyflow", "/work/hand-graph"];

if (process.env.VERCEL_ENV !== "production") {
  console.log("IndexNow: skipped (not a production deploy)");
  process.exit(0);
}

try {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: PATHS.map((p) => `https://${HOST}${p}`),
    }),
    signal: AbortSignal.timeout(10000),
  });
  console.log(`IndexNow: ${res.status} ${res.statusText} for ${PATHS.length} pages`);
} catch (e) {
  console.log(`IndexNow: could not reach the service (${e instanceof Error ? e.message : e})`);
}
