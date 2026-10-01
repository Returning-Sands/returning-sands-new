// generated, do not edit — produced by scripts/extract-tokens.ts from the
// `:root` block of app/globals.css. Edit the CSS and run `npm run prebuild`.
//
// Used by the Share_Card renderers (app/**/opengraph-image.tsx), which
// cannot read CSS custom properties from ImageResponse (design.md
// "Design_Tokens"; Req 13.1).
export const tokens = {
  "sand-50": "#faf5ec",
  "sand-100": "#f1e8d4",
  "sand-200": "#e8dcc4",
  "sand-300": "#d4b886",
  "sand-400": "#c19a5b",
  "ochre-500": "#b8651f",
  "ochre-600": "#8b4513",
  "nile-700": "#1a3a52",
  "nile-800": "#122a3d",
  "nile-900": "#0a1825",
  "ink": "#18130c",
  "stamp-200": "#e2c9d3",
  "stamp-400": "#b487a0",
  "stamp-500": "#96617c",
  "stamp-600": "#7c4c66",
  "stamp-700": "#5f3a4f",
  "accent-ochre-yellow": "#d9a441",
  "accent-deep-blue": "#1b3a5c",
  "accent-brick-red": "#a3391f",
  "accent-pale-pink": "#efd3d0",
  "accent-dusty-blue": "#7f9bb3",
  "accent-terracotta": "#c2643d",
} as const;

export type TokenName = keyof typeof tokens;
