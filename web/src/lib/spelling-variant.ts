/**
 * English spelling by country (Osher's tester note 2026-11-10: "neighbor is
 * written without the u"; Gadi: show the spelling that is customary where
 * the player is).
 *
 * The word banks are written in American English. A player in the UK, South
 * Africa, Australia, India, Europe and the rest of the British-spelling world
 * sees the British form in the games (colour, centre, realise); Canada keeps
 * colour and centre but realize. The country is the request's
 * x-vercel-ip-country. Keys stay American everywhere (mastery records, the
 * picture cache): wordKey() and the picture lookup run toAmerican() first.
 *
 * Pure: no imports, used by the API routes and the shared learn engine.
 */
export type Spelling = "us" | "gb" | "ca";

const GB = new Set([
  // the British Isles and the Commonwealth
  "GB", "IE", "IM", "JE", "GG", "GI", "MT", "CY", "AU", "NZ",
  "ZA", "NA", "BW", "ZW", "ZM", "MW", "MZ", "LS", "SZ", "KE", "UG", "TZ", "RW", "NG", "GH", "SL", "GM", "CM", "MU", "SC",
  "IN", "PK", "BD", "LK", "NP", "MY", "SG", "BN", "HK", "MM",
  "JM", "TT", "BB", "BS", "BZ", "GY", "AG", "DM", "GD", "KN", "LC", "VC", "KY", "BM",
  "FJ", "PG", "WS", "TO", "SB", "VU",
  // the Gulf: British English in the schools
  "AE", "QA", "BH", "KW", "OM",
  // Europe: the schoolbooks are British
  "AT", "BE", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IT", "LV", "LI", "LT", "LU", "NL", "NO",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH", "RS", "BA", "ME", "MK", "AL", "XK", "MD", "UA", "RU", "BY", "GE", "AM", "TR",
]);

/** The spelling customary in a country (ISO 3166 alpha-2). Unknown: American. */
export function spellingFor(country: string | null | undefined): Spelling {
  const c = (country ?? "").trim().toUpperCase();
  if (c === "CA") return "ca";
  return GB.has(c) ? "gb" : "us";
}

/**
 * [American, British, Canada follows the British form]. Base forms only: the
 * suffix engine below derives colours, coloured, colouring, organisation,
 * organiser, centred. Derived forms whose spelling is not regular (favourite,
 * neighbourhood, travelling) are listed as their own pairs. Words that are
 * another word in one spelling (tire/tyre, check/cheque, story/storey,
 * program/programme, practice/practise) are left alone on purpose.
 */
const PAIRS: Array<[string, string, boolean]> = [
  // -or / -our
  ["color", "colour", true], ["favor", "favour", true], ["favorite", "favourite", true], ["favorable", "favourable", true],
  ["flavor", "flavour", true], ["honor", "honour", true], ["honorable", "honourable", true], ["humor", "humour", true],
  ["labor", "labour", true], ["neighbor", "neighbour", true], ["neighborhood", "neighbourhood", true],
  ["behavior", "behaviour", true], ["behavioral", "behavioural", true], ["harbor", "harbour", true], ["armor", "armour", true],
  ["rumor", "rumour", true], ["vapor", "vapour", true], ["odor", "odour", true], ["savor", "savour", true], ["savior", "saviour", true],
  ["valor", "valour", true], ["vigor", "vigour", true], ["candor", "candour", true], ["splendor", "splendour", true],
  ["tumor", "tumour", true], ["parlor", "parlour", true], ["endeavor", "endeavour", true], ["demeanor", "demeanour", true],
  ["fervor", "fervour", true], ["ardor", "ardour", true], ["clamor", "clamour", true], ["rancor", "rancour", true],
  ["arbor", "arbour", true], ["rigor", "rigour", true], ["misdemeanor", "misdemeanour", true],
  ["watercolor", "watercolour", true], ["discolor", "discolour", true], ["multicolor", "multicolour", true],
  // -er / -re
  ["center", "centre", true], ["theater", "theatre", true], ["meter", "metre", true], ["liter", "litre", true],
  ["kilometer", "kilometre", true], ["centimeter", "centimetre", true], ["millimeter", "millimetre", true], ["milliliter", "millilitre", true],
  ["fiber", "fibre", true], ["saber", "sabre", true], ["somber", "sombre", true], ["specter", "spectre", true],
  ["luster", "lustre", true], ["caliber", "calibre", true], ["scepter", "sceptre", true], ["ocher", "ochre", true],
  ["meager", "meagre", true], ["maneuver", "manoeuvre", true], ["louver", "louvre", true],
  // -ize / -ise (Canada keeps -ize)
  ["organize", "organise", false], ["realize", "realise", false], ["recognize", "recognise", false], ["apologize", "apologise", false],
  ["memorize", "memorise", false], ["criticize", "criticise", false], ["emphasize", "emphasise", false], ["minimize", "minimise", false],
  ["maximize", "maximise", false], ["summarize", "summarise", false], ["symbolize", "symbolise", false], ["civilize", "civilise", false],
  ["colonize", "colonise", false], ["energize", "energise", false], ["equalize", "equalise", false], ["fantasize", "fantasise", false],
  ["finalize", "finalise", false], ["generalize", "generalise", false], ["harmonize", "harmonise", false], ["hypnotize", "hypnotise", false],
  ["idolize", "idolise", false], ["immunize", "immunise", false], ["legalize", "legalise", false], ["localize", "localise", false],
  ["magnetize", "magnetise", false], ["mobilize", "mobilise", false], ["modernize", "modernise", false], ["normalize", "normalise", false],
  ["optimize", "optimise", false], ["patronize", "patronise", false], ["personalize", "personalise", false], ["popularize", "popularise", false],
  ["prioritize", "prioritise", false], ["privatize", "privatise", false], ["publicize", "publicise", false], ["randomize", "randomise", false],
  ["specialize", "specialise", false], ["stabilize", "stabilise", false], ["standardize", "standardise", false], ["sterilize", "sterilise", false],
  ["sympathize", "sympathise", false], ["terrorize", "terrorise", false], ["theorize", "theorise", false], ["utilize", "utilise", false],
  ["vaporize", "vaporise", false], ["visualize", "visualise", false], ["vocalize", "vocalise", false], ["categorize", "categorise", false],
  ["characterize", "characterise", false], ["familiarize", "familiarise", false], ["socialize", "socialise", false], ["authorize", "authorise", false],
  ["capitalize", "capitalise", false], ["customize", "customise", false], ["digitize", "digitise", false], ["dramatize", "dramatise", false],
  ["economize", "economise", false], ["fertilize", "fertilise", false], ["formalize", "formalise", false], ["globalize", "globalise", false],
  ["humanize", "humanise", false], ["itemize", "itemise", false], ["jeopardize", "jeopardise", false], ["mechanize", "mechanise", false],
  ["neutralize", "neutralise", false], ["oxidize", "oxidise", false], ["plagiarize", "plagiarise", false], ["pulverize", "pulverise", false],
  ["scrutinize", "scrutinise", false], ["subsidize", "subsidise", false], ["tantalize", "tantalise", false], ["traumatize", "traumatise", false],
  ["vandalize", "vandalise", false], ["victimize", "victimise", false], ["hospitalize", "hospitalise", false], ["industrialize", "industrialise", false],
  ["urbanize", "urbanise", false], ["sanitize", "sanitise", false], ["agonize", "agonise", false], ["baptize", "baptise", false],
  ["analyze", "analyse", false], ["paralyze", "paralyse", false], ["catalyze", "catalyse", false],
  // -og / -ogue
  ["catalog", "catalogue", true], ["dialog", "dialogue", true], ["analog", "analogue", true], ["monolog", "monologue", true],
  // -ense / -ence
  ["defense", "defence", true], ["offense", "offence", true], ["pretense", "pretence", true],
  // one l / two l
  ["traveler", "traveller", true], ["traveling", "travelling", true], ["traveled", "travelled", true],
  ["canceled", "cancelled", true], ["canceling", "cancelling", true], ["modeled", "modelled", true], ["modeling", "modelling", true],
  ["labeled", "labelled", true], ["labeling", "labelling", true], ["signaled", "signalled", true], ["signaling", "signalling", true],
  ["fueled", "fuelled", true], ["fueling", "fuelling", true], ["quarreled", "quarrelled", true], ["quarreling", "quarrelling", true],
  ["leveled", "levelled", true], ["leveling", "levelling", true], ["dialed", "dialled", true], ["dialing", "dialling", true],
  ["totaled", "totalled", true], ["equaled", "equalled", true], ["tunneled", "tunnelled", true], ["tunneling", "tunnelling", true],
  ["channeled", "channelled", true], ["pedaled", "pedalled", true], ["pedaling", "pedalling", true], ["shoveled", "shovelled", true],
  ["jewelry", "jewellery", true], ["jeweler", "jeweller", true], ["counselor", "counsellor", true], ["marvelous", "marvellous", true],
  ["woolen", "woollen", true], ["enroll", "enrol", false], ["enrollment", "enrolment", false], ["fulfill", "fulfil", false],
  ["fulfillment", "fulfilment", false], ["skillful", "skilful", false], ["installment", "instalment", false], ["willful", "wilful", false],
  ["distill", "distil", false], ["instill", "instil", false],
  // one by one
  ["gray", "grey", true], ["ax", "axe", true], ["plow", "plough", true], ["snowplow", "snowplough", true], ["pajamas", "pyjamas", true],
  ["mom", "mum", false], ["mommy", "mummy", false], ["mold", "mould", true], ["molt", "moult", true], ["smolder", "smoulder", true],
  ["donut", "doughnut", true], ["cozy", "cosy", false], ["aluminum", "aluminium", false], ["airplane", "aeroplane", false],
  ["math", "maths", false], ["mustache", "moustache", true], ["chili", "chilli", false], ["licorice", "liquorice", false],
  ["omelet", "omelette", true], ["specialty", "speciality", false], ["artifact", "artefact", false], ["skeptic", "sceptic", false],
  ["skeptical", "sceptical", false], ["sulfur", "sulphur", true], ["sulfate", "sulphate", true], ["tidbit", "titbit", false],
  ["pediatric", "paediatric", false], ["pediatrician", "paediatrician", false], ["orthopedic", "orthopaedic", false],
  ["archeology", "archaeology", true], ["esophagus", "oesophagus", false], ["anemia", "anaemia", false], ["diarrhea", "diarrhoea", false],
  ["leukemia", "leukaemia", false], ["hemoglobin", "haemoglobin", false], ["estrogen", "oestrogen", false], ["fetus", "foetus", false],
];

const US_TO: Record<Spelling, Map<string, string>> = { us: new Map(), gb: new Map(), ca: new Map() };
const TO_US = new Map<string, string>();
for (const [us, gb, ca] of PAIRS) {
  US_TO.gb.set(us, gb);
  US_TO.ca.set(us, ca ? gb : us);
  TO_US.set(gb, us);
}

/** Longest first, so "centred" is centre + ed, not centr + ed. */
const SUFFIXES = ["ation", "ations", "ing", "ed", "er", "ers", "es", "s", "ful", "less"].sort((a, b) => b.length - a.length);
/** Suffixes that can follow a base whose final e was dropped (organis-ation, centr-ed). */
const DROPS_E = new Set(["ation", "ations", "ing", "ed", "er", "ers"]);
const SIBILANT = /(x|s|z|ch|sh)$/;

function join(base: string, suffix: string, viaE: boolean): string {
  if (viaE) return base.replace(/e$/, "") + suffix;
  if (suffix === "s" && SIBILANT.test(base)) return base + "es";
  if (suffix === "es" && base.endsWith("e")) return base + "s";
  if (/^[ei]/.test(suffix) && base.endsWith("e")) return base.slice(0, -1) + suffix;
  return base + suffix;
}

/** The word in the other spelling, or itself. Keeps the first capital. */
function convert(word: string, map: Map<string, string>): string {
  const w = word.trim();
  const lower = w.toLowerCase();
  if (!/^[a-z]+$/.test(lower)) return w;
  let out: string | undefined = map.get(lower);
  if (out === undefined) {
    for (const s of SUFFIXES) {
      if (lower.length <= s.length + 2 || !lower.endsWith(s)) continue;
      const stem = lower.slice(0, -s.length);
      const direct = map.get(stem);
      if (direct !== undefined) { out = join(direct, s, false); break; }
      const viaE = DROPS_E.has(s) ? map.get(stem + "e") : undefined;
      if (viaE !== undefined) { out = join(viaE, s, true); break; }
    }
  }
  if (out === undefined || out === lower) return w;
  return w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase() ? out[0].toUpperCase() + out.slice(1) : out;
}

/** An American bank word as the player's country writes it. */
export function toSpelling(word: string, spelling: Spelling): string {
  return spelling === "us" ? word : convert(word, US_TO[spelling]);
}

/** Back to the American form the banks and keys use. */
export function toAmerican(word: string): string {
  return convert(word, TO_US);
}
