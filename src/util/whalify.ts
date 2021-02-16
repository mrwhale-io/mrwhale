const whaleReplacements = [
  "we(l+)",
  "wail",
  "while",
  "welp",
  "wile",
  "we'll",
  "whirl",
  "way i('*)ll",
  "way all",
];

const narwhaleReplacements = ["now we('*)ll", "now i('*)ll"];

/**
 * Replaces given text with whale.
 * @param str The string to whalify.
 */
export function whalify(str: string): string {
  for (const replacement of narwhaleReplacements) {
    str = str.replace(new RegExp(replacement, "gi"), "narwhal");
  }

  for (const replacement of whaleReplacements) {
    str = str.replace(
      new RegExp(`\\w*(?<!mr\\.*\\s*)${replacement}`, "gi"),
      "whale"
    );
  }

  str = str.replace(new RegExp("ual", "gi"), "uwhale");
  str = str.replace(new RegExp("([A-Za-z]+)way", "gi"), "$1whale");

  return str;
}
