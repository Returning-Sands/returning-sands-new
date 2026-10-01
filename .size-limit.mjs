// Size budget for the Home route's first-party JavaScript (Req 19.5).
//
// Turbopack names every client chunk by content hash
// (`.next/static/chunks/<hash>.js`), so no static glob can single out the
// chunks the Home page actually loads. Instead we read the pre-rendered
// Home HTML and measure exactly the `/_next/static/...js` files it
// references. Requires `npm run build` to have run first.
import { readFileSync } from "node:fs";

const HOME_HTML = ".next/server/app/index.html";

let html;
try {
  html = readFileSync(HOME_HTML, "utf8");
} catch {
  throw new Error(`${HOME_HTML} not found. Run \`npm run build\` before \`npm run size\`.`);
}

const chunks = [
  ...new Set(
    [...html.matchAll(/\/_next\/static\/([^"'\s]+?\.js)/g)].map(
      (m) => `.next/static/${m[1]}`,
    ),
  ),
];

if (chunks.length === 0) {
  throw new Error(`No /_next/static/*.js references found in ${HOME_HTML}.`);
}

// 200 KB: Next 16 app router + React 19 client chunks are ~155 KB gzip on
// their own; site code is ~30 KB. The budget exists to catch an added heavy
// dependency, not to squeeze the framework. Measured 185.84 KB on 2026-09-30.
const checks = [
  {
    name: "Home route first-party JS",
    path: chunks,
    limit: "200 KB",
    gzip: true,
  },
];

export default checks;
