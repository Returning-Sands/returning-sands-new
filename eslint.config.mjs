import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Colour literals are only allowed in app/globals.css (Req 13.1). Components
// must reference the tokens via Tailwind classes or CSS variables. The regex
// catches `#abc`, `#aabbcc`, `#aabbccdd` and any `rgb(` / `rgba(` call that
// appears inside a string or template literal.
const HEX_LITERAL = String.raw`/#[0-9a-fA-F]{3,8}\b/`;
const RGB_LITERAL = String.raw`/rgb\(/`;
const NO_COLOUR_LITERALS_MESSAGE =
  "Colour literals (#hex / rgb()) belong in app/globals.css tokens, not in components (Req 13.1).";

// Physical-direction Tailwind utilities break right-to-left mirroring
// (Req 13.17, Arabic edition roadmap). Use the logical equivalents:
//   ml-/mr- -> ms-/me-     pl-/pr- -> ps-/pe-     left-/right- -> start-/end-
//   border-l-/border-r- -> border-s-/border-e-    rounded-l-/-r- -> rounded-s-/-e-
//   text-left/text-right -> text-start/text-end
// `left-1/2` (symmetric centring with -translate-x-1/2) is exempt.
const PHYSICAL_DIRECTION = String.raw`/(?<![\w-])(?:(?:ml|mr|pl|pr|right|border-l|border-r|rounded-l|rounded-r|scroll-ml|scroll-mr|scroll-pl|scroll-pr)-|text-(?:left|right)(?![\w-])|left-(?!1\/2(?![\w\/])))/`;
const NO_PHYSICAL_DIRECTION_MESSAGE =
  "Use logical Tailwind utilities (ms-/me-/ps-/pe-/start-/end-/border-s-/border-e-/text-start/text-end) so the layout mirrors in RTL (Req 13.17).";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.log",
    "test-results/**",
    "playwright-report/**",
  ]),
  {
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    // opengraph-image.tsx must use raw colours (ImageResponse cannot read CSS
    // variables); lib/tokens.ts is the generated token table itself.
    ignores: ["app/**/opengraph-image.tsx", "lib/tokens.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${HEX_LITERAL}]`,
          message: NO_COLOUR_LITERALS_MESSAGE,
        },
        {
          selector: `TemplateElement[value.raw=${HEX_LITERAL}]`,
          message: NO_COLOUR_LITERALS_MESSAGE,
        },
        {
          selector: `Literal[value=${RGB_LITERAL}]`,
          message: NO_COLOUR_LITERALS_MESSAGE,
        },
        {
          selector: `TemplateElement[value.raw=${RGB_LITERAL}]`,
          message: NO_COLOUR_LITERALS_MESSAGE,
        },
        {
          selector: `Literal[value=${PHYSICAL_DIRECTION}]`,
          message: NO_PHYSICAL_DIRECTION_MESSAGE,
        },
        {
          selector: `TemplateElement[value.raw=${PHYSICAL_DIRECTION}]`,
          message: NO_PHYSICAL_DIRECTION_MESSAGE,
        },
      ],
    },
  },
]);
