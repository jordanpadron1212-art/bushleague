/**
 * Name banks — LAWS.md Law 14: "Generator banks with real flavor for
 * players, coaches, rivals, events. Never Player_1." Ported verbatim from
 * bush-league-v0.10.html's FN_A/FN_L/FN_W/LN_A/LN_L/LN_W and `genName()`.
 * Weighted 60% American / 33% Latin American / 7% Japanese-Korean, matching
 * the old build's draw — not sourced to a real demographic figure (nowhere
 * in RESEARCH.md), a Tier 3 flavor choice, called out as such rather than
 * dressed up as researched.
 */
import type { Rng } from "./rng.js";
import { pick } from "./rng.js";

const FN_A = "James,Michael,Robert,Ryan,Tyler,Cody,Brandon,Austin,Dalton,Colton,Hunter,Chase,Cooper,Bryce,Garrett,Wyatt,Trevor,Logan,Mason,Blake,Carson,Landon,Grayson,Brayden,Kyle,Jared,Dustin,Shane,Cole,Brett,Drew,Zane,Tanner,Bo,Cade,Rhett,Beau,Gavin,Reid,Jace,Knox,Boone,Weston,Griffin,Maddox,Peyton,Camden,Easton,Holden,Tate".split(",");
const FN_L = "Luis,Carlos,Jose,Juan,Miguel,Rafael,Eduardo,Wilmer,Yordan,Ronald,Julio,Sandy,Framber,Ranger,Elvis,Adolis,Willy,Nestor,Gleyber,Oswaldo,Andres,Ramon,Yoan,Marcell,Jhoan,Cristian,Yandy,Randy,Jeimer,Alejandro,Emmanuel,Hector,Orlando,Edwin,Geraldo,Osvaldo,Yerry,Alexis,Junior,Deivi,Bryan,Jorge,Nelson,Ozzie,Teoscar,Vidal,Wander,Yusniel,Ender,Aristides".split(",");
const FN_W = "Shohei,Yoshinobu,Masataka,Kodai,Seiya,Yu,Hyun-jin,Ha-seong,Jung-hoo,Woo-suk,Kenta,Shota,Naoyuki,Tomoyuki,Ji-man,Kwang-hyun,Rintaro,Roki,Munetaka,Teoscar".split(",");
const LN_A = "Grimsley,Okonkwo,Whitfield,Barlowe,Kessler,Dunmore,Hollingsworth,Vance,Prentiss,Radford,Sturgis,Cavanaugh,Mullins,Draeger,Bellweather,Kirkland,Ashby,Renfroe,Halloran,Stackhouse,Winslow,Bramble,Cusack,Thorsen,Lamplough,Ferriday,Ostrander,Quillen,Sandoval,Tarkington,Vandergriff,Wexler,Yardley,Zimmer,Blackwood,Copeland,Deforest,Everhart,Fairbanks,Gastineau,Hemsley,Ironside,Jessup,Kilgore,Larkspur,Merriweather,Northcutt,Oglethorpe,Pemberton,Quintrell,Rutledge,Stallworth,Thackery,Underhill,Vosburgh,Whitlock,Yarborough,Ziegler,Ackerly,Boatwright".split(",");
const LN_L = "Villalobos,Tavares,Reyes,Encarnacion,Betancourt,Almonte,Guerrero,Mendoza,Cabrera,Feliciano,Ramirez,Escobar,Alcantara,Zambrano,Peralta,Ynoa,Sanabria,Machado,Bautista,Carrasco,Duran,Espinoza,Fermin,Grullon,Hernandez,Inoa,Jimenez,Lugo,Marte,Nunez,Ozuna,Polanco,Quintana,Rosario,Severino,Tejada,Urena,Valdez,Yepez,Adrianza,Bracho,Contreras,Delgado,Estrada,Franco,Gurriel,Herrera,Infante,Javier,Linares".split(",");
const LN_W = "Ohtani,Yamamoto,Yoshida,Senga,Suzuki,Darvish,Ryu,Kim,Lee,Go,Maeda,Imanaga,Sasaki,Murakami,Okamoto,Kikuchi,Matsui,Nakamura,Tanaka,Fujinami".split(",");

export function genName(r: Rng): [string, string] {
  const roll = r();
  if (roll < 0.6) return [pick(FN_A, r), pick(LN_A, r)];
  if (roll < 0.93) return [pick(FN_L, r), pick(LN_L, r)];
  return [pick(FN_W, r), pick(LN_W, r)];
}

/**
 * Club abbreviations, unique within a league — DECISIONS.md's own catalogue
 * of a Law 14 failure: "Sioux City" and "Sioux Falls" both truncated to SIO
 * before this fix, putting two identical rows in one standings table.
 * Multi-word cities take two letters from the first word plus one from the
 * second, which is also how real clubs abbreviate.
 */
/** `s[i]`, but "" instead of undefined for an out-of-range index — the original build would have silently concatenated the literal string "undefined" into an abbreviation for a one- or two-character city-name word (never hit in practice, fixed rather than reproduced). */
const at = (s: string, i: number): string => s[i] ?? "";

export function abbrFor(city: string, taken: Record<string, 1>): string {
  const words = city.replace(/[^A-Za-z \-/]/g, "").split(/[\s\-/]+/).filter(Boolean);
  const w0 = (words[0] ?? "XXX").toUpperCase();
  const w1 = (words[1] ?? "").toUpperCase();
  const cands: string[] = [];
  if (w1) {
    cands.push(w0.slice(0, 2) + at(w1, 0), at(w0, 0) + at(w0, 2) + at(w1, 0), at(w0, 0) + w1.slice(0, 2), w0.slice(0, 3));
  } else {
    cands.push(w0.slice(0, 3), at(w0, 0) + at(w0, 2) + at(w0, 3), at(w0, 0) + at(w0, 1) + at(w0, w0.length - 1));
  }
  for (const raw of cands) {
    const c = (raw ?? "").replace(/[^A-Z]/g, "");
    if (c.length === 3 && !taken[c]) {
      taken[c] = 1;
      return c;
    }
  }
  const base = (w0 + "XXX").slice(0, 2);
  for (let i = 0; i < 26; i++) {
    const c = base + String.fromCharCode(65 + i);
    if (!taken[c]) {
      taken[c] = 1;
      return c;
    }
  }
  return (w0 + "XXX").slice(0, 3);
}
