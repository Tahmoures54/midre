import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const staticDir = join(root, ".vercel/output/static");
const dest = join(root, "android/app/src/main/assets/www");

if (!existsSync(staticDir)) {
  console.error("[apk] Missing .vercel/output/static — run npm run build first.");
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(staticDir, dest, { recursive: true });

const assetDir = join(dest, "assets");
if (!existsSync(assetDir)) {
  console.error("[apk] Build output has no assets/ folder.");
  process.exit(1);
}

const files = readdirSync(assetDir);
const js = files.find((name) => name.startsWith("index-") && name.endsWith(".js"));
const css = files.find((name) => name.startsWith("styles-") && name.endsWith(".css"));
if (!js || !css) {
  console.error("[apk] Could not find hashed index/styles assets:", files);
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0e1412" />
    <title>یادآور دارو</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="stylesheet" href="./assets/${css}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" />
  </head>
  <body>
    <script type="module" src="./assets/${js}"></script>
  </body>
</html>
`;

writeFileSync(join(dest, "index.html"), html);
writeFileSync(join(dest, ".gitkeep"), "");
console.log(`[apk] Packed web assets → android/app/src/main/assets/www (${js}, ${css})`);
