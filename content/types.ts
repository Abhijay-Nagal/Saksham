// Content contract for Saksham. All JSON in /content conforms to these types.
// This file is the source of truth for content shape. Do not change field names;
// the content JSON files were authored against them.

export type AgeBand = 'young' | 'teen'; // young = 8–11, teen = 12–16

export type Mood = 'normal' | 'happy' | 'sad' | 'angry' | 'worried' | 'proud';

// DiceBear Big Smile hair variants (v10 option names)
export type HairVariant =
  | 'bangs' | 'bowlCutHair' | 'braids' | 'bunHair' | 'curlyBob' | 'curlyShortHair'
  | 'froBun' | 'halfShavedHead' | 'mohawk' | 'shavedHead' | 'shortHair'
  | 'straightHair' | 'wavyBob';

export type Headwear = 'patka' | 'hijab' | 'dupatta'; // custom SVG overlays (stretch phase)

export interface AvatarSpec {
  skin: string;            // hex, one of world.json avatarPalette.skins
  hair: HairVariant;
  hairColor: string;       // hex
  accessory?: 'glasses' | 'mustache';
  headwear?: Headwear;     // ignored until headwear overlays exist
}

export interface CastMember {
  id: string;
  name: string;
  role: 'kid' | 'adult' | 'elder'; // adults render 1.0 scale, kids 0.85
  avatar: AvatarSpec;
}

export type SceneBg = 'school' | 'street' | 'dhaba' | 'home' | 'panchayat';

// Special speaker ids: 'narrator' (no nameplate) and 'mitthu' (parrot hint bubble)
export interface StoryNode {
  id: string;
  bg?: SceneBg;                 // persists until changed
  props?: string[];             // sprite keys on stage; persists until changed
  cast?: string[];              // cast ids on stage, left to right, max 3; persists until changed
  speaker: string;              // cast id | 'narrator' | 'mitthu'
  moods?: Record<string, Mood>; // per cast id; unspecified = 'normal'
  text: string;
  next?: string;                // tap to continue
  choices?: Choice[];           // shown after text finishes typing
  end?: 'good' | 'retry';       // retry = return to the last node that had choices
}

export interface Choice {
  label: string;
  sprite?: string;
  to: string;
  kind: 'good' | 'bad' | 'okay'; // for analytics/feedback only; never shown as a label
}

export interface Card {
  id: string;
  title: string;
  sprite: string;
  color: 'peacock' | 'rani' | 'leaf' | 'marigold';
  kid: string;          // shown to young band
  teen: string;         // shown to teen band (young can tap "Tell me more")
  ifItHappens: string;
  law: string;          // short label on the card
  source: string;       // full citation, shown in small text on back
}

export interface QuizQuestion {
  id: string;
  q: string;
  options: string[];
  answer: number;       // index into options
  explain: string;      // shown after answering, right or wrong
  band?: 'teen';        // teen-only question
}

export interface QuizGame {
  type: 'quiz';
  title: string;
  questions: QuizQuestion[];
}

export interface SortItem {
  id: string;
  text: string;
  bin: string;          // SortBin id
  explain: string;
}

export interface SortBin {
  id: string;
  label: string;
  sprite: string;
  color: 'leaf' | 'rani' | 'peacock' | 'marigold';
}

export interface SortGame {
  type: 'sort';
  title: string;
  prompt: string;
  bins: [SortBin, SortBin];
  items: SortItem[];
}

export type MiniGame = QuizGame | SortGame;

export interface Building {
  id: string;
  title: string;
  sprite: string;
  right: string;        // name of the right, shown on intro sheet
  tagline: string;      // one line for the intro sheet
  tone: 'normal' | 'gentle'; // gentle = soft sparkle instead of confetti, no loud sounds
  cast: CastMember[];
  story: { start: string; nodes: StoryNode[] };
  card: Card;
  game: MiniGame;
}

export interface MapSpot {
  id: string;           // building id, or 'help', 'playground', 'cyber'
  x: number;            // design units, 0–1000
  y: number;            // design units, 0–mapHeight
  status: 'playable' | 'locked-teaser' | 'help';
  title: string;
  sprite: string;
  teaser?: string;      // for locked-teaser
}

export interface Badge {
  id: string;
  title: string;
  sprite: string;
  how: string;          // shown in Me screen when locked
}
