// Prints /resume/ to assets/Kunal-Varshney-Resume.pdf using the page's print styles
// (resume/css/resume-theme.css, @media print). Run: npm run resume:pdf
// Serves the repo over a throwaway local HTTP server so localStorage, fonts and relative CSS behave.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const REPO = path.resolve(__dirname, "..");
const OUT = path.join(REPO, "assets", "Kunal-Varshney-Resume.pdf");

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".pdf": "application/pdf" };

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(REPO, rel);
  if (!file.startsWith(REPO) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, "127.0.0.1", async () => {
  const url = `http://127.0.0.1:${server.address().port}/resume/`;
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => { try { localStorage.setItem("kv-theme", "light"); } catch (e) {} });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: OUT, printBackground: true, preferCSSPageSize: true });
    console.log("wrote", path.relative(REPO, OUT), fs.statSync(OUT).size, "bytes");
  } finally {
    await browser.close();
    server.close();
  }
});
