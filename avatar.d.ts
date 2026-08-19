export type SpeciesName =
  | "ghost"
  | "cat"
  | "bear"
  | "bunny"
  | "robot"
  | "blob"
  | "bird"
  | "dog"
  | "frog"
  | "penguin"
  | "alien"
  | "mouse";

export interface Palette {
  name: string;
  /** background color */
  bg: string;
  /** primary body color */
  p: string;
  /** secondary accent color */
  s: string;
}

export interface RenderOptions {
  /** Any string; the same seed always produces the same avatar. Default "avatar". */
  seed?: string;
  /** A species name, or "auto" to pick from the seed. Default "auto". */
  species?: SpeciesName | "auto";
  /** A palette name from PALETTES, or "auto" to pick from the seed. Default "auto". */
  palette?: string;
  /** "two" (two-color) or "mono" (monochrome). Default "two". */
  mode?: "two" | "mono";
  /** Corner the character emerges from, or "auto". Default "auto". */
  corner?: "left" | "right" | "auto";
}

/** Render an avatar as an SVG string (512×512 viewBox). */
export declare function renderAvatar(opts?: RenderOptions): string;

export declare const PALETTES: Palette[];
export declare const SPECIES_NAMES: SpeciesName[];
export declare const SIZE: number;
