/**
 * Chinese / Japanese / Korean font stylesheet (Google Fonts, loaded at
 * runtime only on those UI languages). Shared by the root layout (server,
 * first paint) and CjkFonts (client, in-app language switch).
 */
const CJK: Record<string, string> = {
  ja: "Noto+Sans+JP",
  "zh-CN": "Noto+Sans+SC",
  "zh-TW": "Noto+Sans+TC",
  ko: "Noto+Sans+KR",
};

export function cjkHref(lang: string): string | null {
  const fam = CJK[lang];
  return fam ? `https://fonts.googleapis.com/css2?family=${fam}:wght@400..700&display=swap` : null;
}
