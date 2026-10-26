export type AlgorithmCase = {
  id: string;
  name: string;
  family: string;
  recognition: string;
  algorithm: string;
  step: 'OLL' | 'PLL';
  group: string;
};

// Standard CFOP OLL case numbering. Algorithms are local data and use common
// finger-friendly variants; lowercase face turns mean wide turns.
const ollRows: [number, string, string][] = [
  [1, 'Dot', "R U2 R2 F R F' U2 R' F R F'"],
  [2, 'Dot', "F R U R' U' F' f R U R' U' f'"],
  [3, 'Dot', "f R U R' U' f' U' F R U R' U' F'"],
  [4, 'Dot', "f R U R' U' f' U F R U R' U' F'"],
  [5, 'Square', "l' U2 L U L' U l"],
  [6, 'Square', "r U2 R' U' R U' r'"],
  [7, 'Small lightning', "r U R' U R U2 r'"],
  [8, 'Small lightning', "R U2 R' U2 R' F R F'"],
  [9, 'Fish', "R U R' U' R' F R2 U R' U' F'"],
  [10, 'Fish', "R U R' U R' F R F' R U2 R'"],
  [11, 'Small lightning', "F' L' U' L U F y F R U R' U' F'"],
  [12, 'Small lightning', "F R U R' U' F' U F R U R' U' F'"],
  [13, 'Knight move', "r U' r' U' r U r' y' R' U R"],
  [14, 'Knight move', "R' F R U R' F' R y' R U' R'"],
  [15, 'Knight move', "l' U' l L' U' L U l' U l"],
  [16, 'Knight move', "r U r' R U R' U' r U' r'"],
  [17, 'Dot', "R U R' U R' F R F' U2 R' F R F'"],
  [18, 'Dot', "F R U R' U y' R' U2 R' F R F'"],
  [19, 'Dot', "r' R U R U R' U' r R2' F R F'"],
  [20, 'Dot', "M U R U R' U' M2 U R U' r'"],
  [21, 'Cross', "R U2 R' U' R U R' U' R U' R'"],
  [22, 'Cross', "R U2 R2 U' R2 U' R2 U2 R"],
  [23, 'Cross', "R2 D R' U2 R D' R' U2 R'"],
  [24, 'Cross', "l' U' L U R U' r' F"],
  [25, 'Cross', "R' F R B' R' F' R B"],
  [26, 'Cross', "R' U' R U' R' U2 R"],
  [27, 'Cross', "R U R' U R U2 R'"],
  [28, 'Arrow', "M' U M U2 M' U M"],
  [29, 'Awkward', "M U R U R' U' R' F R F' M'"],
  [30, 'Awkward', "R2 U R' B' R U' R2 U R B R'"],
  [31, 'P shape', "R' U' F U R U' R' F' R"],
  [32, 'P shape', "R U B' U' R' U R B R'"],
  [33, 'T shape', "R U R' U' R' F R F'"],
  [34, 'C shape', "R U R2 U' R' F R U R U' F'"],
  [35, 'Fish', "R U2 R2 F R F' R U2 R'"],
  [36, 'W shape', "R' U' R U' R' U R U R y R' F' R"],
  [37, 'Fish', "F R U' R' U' R U R' F'"],
  [38, 'W shape', "R U R' U R U' R' U' R' F R F'"],
  [39, 'Big lightning', "L F' L' U' L U F U' L'"],
  [40, 'Big lightning', "R' F R U R' U' F' U R"],
  [41, 'Awkward', "R U' R' U2 R U y R U' R' U' F'"],
  [42, 'Awkward', "R' U2 R U R' U R y F R U R' U' F'"],
  [43, 'P shape', "R' U' F R' F' R U R"],
  [44, 'P shape', "f R U R' U' f'"],
  [45, 'T shape', "F R U R' U' F'"],
  [46, 'C shape', "R' U' R' F R F' U R"],
  [47, 'L shape', "R' U' R' F R F' R U R"],
  [48, 'L shape', "F R U R' U' R U R' U' F'"],
  [49, 'L shape', "R' F R2 B' R2 F' R2 B R'"],
  [50, 'L shape', "R B' R B R2 U2 F R' F' R"],
  [51, 'I shape', "f R U R' U' R U R' U' f'"],
  [52, 'I shape', "R U R' U R d' R U' R' F'"],
  [53, 'L shape', "l' U' L U' L' U L U' L' U2 l"],
  [54, 'L shape', "r U R' U R U' R' U R U2 r'"],
  [55, 'I shape', "R U2 R2 U' R U' R' U2 F R F'"],
  [56, 'I shape', "F R U R' U' R F' r U R' U' r'"],
  [57, 'H shape', "R U R' U' M' U R U' r'"],
];

const ollRecognition: Record<string, string> = {
  Dot: 'No top edge is oriented. Read the corner blocks and headlights to choose this dot-pattern case.',
  Square: 'A compact square of oriented stickers sits on the top pattern; use its corner pair to set the angle.',
  'Small lightning': 'A small lightning-bolt silhouette is the cue. Compare whether the sticker block aligns with the bolt head.',
  Fish: 'A fish-like group of oriented corners gives the case away; use the corner block to set your angle.',
  'Knight move': 'The oriented corner stickers form a knight-move silhouette; spot the block before choosing the angle.',
  Cross: 'All four top edges are oriented. Use the corner headlights, bars, and blocks to distinguish the pattern.',
  Arrow: 'All four top edges are oriented; the corner stickers form the arrow pattern.',
  Awkward: 'An awkward corner pattern; use headlights or the sticker block to identify its facing.',
  'P shape': 'A P-shaped corner group is the cue. Check which side the oriented bar faces.',
  'T shape': 'A T-shaped pattern of oriented corners is the recognition cue.',
  'C shape': 'The corner stickers create a C silhouette; use the side bar to set the angle.',
  'W shape': 'A W-shaped corner pattern; notice whether the sticker block faces front or a side.',
  'Big lightning': 'A large lightning-bolt pattern identifies this family; inspect the neighboring corner block.',
  'L shape': 'The oriented corner pattern forms an L; use headlights and bars to distinguish its orientation.',
  'I shape': 'A line-like corner pattern forms an I; identify the number and placement of sticker bars.',
  'H shape': 'The corner stickers form an H pattern while all four top edges are oriented.',
};

export const ollCases: AlgorithmCase[] = ollRows.map(([number, family, algorithm]) => ({
  id: `OLL-${String(number).padStart(2, '0')}`,
  name: `OLL ${String(number).padStart(2, '0')}`,
  family,
  recognition: ollRecognition[family],
  algorithm,
  step: 'OLL',
  group: family === 'Cross' ? 'Cross' : family === 'Dot' ? 'Dot' : family,
}));

// Standard 21 PLL cases. Recognition notes distinguish the moved piece groups.
const pllRows: [string, string, string][] = [
  ['Aa', 'Three corners cycle counter-clockwise; the edges are already solved.', "x R' U R' D2 R U' R' D2 R2 x'"],
  ['Ab', 'Three corners cycle clockwise; the edges are already solved.', "x R2 D2 R U R' D2 R U' R x'"],
  ['E', 'The four corners cycle while every edge remains in place.', "x' R U' R' D R U R' D' R U R' D R U' R' D' x"],
  ['F', 'Adjacent corners swap and three edges cycle; find the paired corner stickers.', "R' U' F' R U R' U' R' F R2 U' R'"],
  ['Ga', 'A three-corner cycle paired with a three-edge cycle; find the matching headlights.', "R2 U R' U R' U' R U' R2 D U' R' U R D'"],
  ['Gb', 'A G permutation with the mirrored corner and edge cycle.', "R' U' R U D' R2 U R' U R U' R U' R2 D"],
  ['Gc', 'A G permutation with its opposite edge cycle; use the headlights to orient.', "R2 U' R U' R U R' U R2 D' U R U' R' D"],
  ['Gd', 'The remaining G permutation; pair the corner headlights with the edge bar.', "R U R' U' D R2 U' R U' R' U R' U R2 D'"],
  ['H', 'Opposite edges swap in two pairs; corners stay solved.', "M2 U M2 U2 M2 U M2"],
  ['Ja', 'Adjacent corners swap with a three-edge cycle; identify the corner headlights.', "x R2 F R F' R U2 r' U r U2 x'"],
  ['Jb', 'Adjacent corner swap with a three-edge cycle; the headlights face the other side.', "R U R' F' R U R' U' R' F R2 U' R'"],
  ['Na', 'Two corner swaps and a paired edge cycle; look for the diagonal corner pattern.', "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"],
  ['Nb', 'The mirrored N permutation; inspect the diagonal corner swaps.', "R' U R U' R' F' U' F R U R' F R' F' R U' R"],
  ['Ra', 'Adjacent corner swap paired with a three-edge cycle (Ra).', "R U' R' U' R U R D R' U' R D' R' U2 R'"],
  ['Rb', 'Adjacent corner swap paired with a three-edge cycle (Rb).', "R' U2 R U2 R' F R U R' U' R' F' R2"],
  ['T', 'One adjacent corner swap plus a three-edge cycle; look for the T-shaped block.', "R U R' U' R' F R2 U' R' U' R U R' F'"],
  ['Ua', 'Three edges cycle counter-clockwise; corners are solved.', "M2 U M U2 M' U M2"],
  ['Ub', 'Three edges cycle clockwise; corners are solved.', "M2 U' M U2 M' U' M2"],
  ['V', 'Diagonal corners swap with a three-edge cycle; look for the matching corner pair.', "R' U R' U' y R' F' R2 U' R' U R' F R F"],
  ['Y', 'Diagonal corner swap with a three-edge cycle; identify the diagonal corner pair.', "F R U' R' U' R U R' F' R U R' U' R' F R F'"],
  ['Z', 'Two pairs of adjacent edges swap; corners stay solved.', "M' U' M2 U' M2 U' M' U2 M2"],
];

export const pllCases: AlgorithmCase[] = pllRows.map(([name, recognition, algorithm]) => ({
  id: `PLL-${name}`,
  name: `PLL ${name}`,
  family: name,
  recognition,
  algorithm,
  step: 'PLL',
  group: ['Aa', 'Ab', 'E'].includes(name) ? 'Corners' : ['H', 'Ua', 'Ub', 'Z'].includes(name) ? 'Edges' : 'Corner + edge',
}));

export const allCases = [...ollCases, ...pllCases];

export type F2LCase = { id: string; title: string; type: string; cue: string; algorithm: string; note: string };

export const f2lCases: F2LCase[] = [
  { id: 'pair-top', title: 'Solved pair above its slot', type: 'Pair ready', cue: 'Both pieces are paired with the white corner facing up. Keep the pair intact and insert into the open front-right slot.', algorithm: "R U' R'", note: "Mirror to the left slot: L' U L. Rotate the pair into a comfortable front slot before insertion." },
  { id: 'pair-front', title: 'Connected pair, front-right', type: 'Connected', cue: 'Corner and edge touch in the upper layer, with the edge sticker facing front.', algorithm: "U R U' R'", note: 'The U move aligns the pair with its slot; the final trigger drops it in without splitting.' },
  { id: 'pair-back', title: 'Connected pair, back-right', type: 'Connected', cue: 'A connected pair sits behind the target slot. Bring it forward with a U adjustment.', algorithm: "U' R U R'", note: 'Use a back-slot setup only when it preserves the solved cross and other pairs.' },
  { id: 'split-front', title: 'Split pair, edge in front', type: 'Split', cue: 'Corner and edge are separated by one turn. Open the slot, connect them, then insert.', algorithm: "R U R' U' R U R'", note: 'Think: open, connect, close. This is the fundamental right-hand insertion family.' },
  { id: 'split-right', title: 'Split pair, corner at front-right', type: 'Split', cue: 'The corner is above its slot while its edge is in the front layer.', algorithm: "U' R U2 R' U R U' R'", note: 'The extra U2 moves the edge away from the slot so the pair can join cleanly.' },
  { id: 'corner-slot', title: 'Corner in slot, wrong orientation', type: 'Corner in slot', cue: 'The target corner is already in its slot but twisted. Extract it while pairing the edge.', algorithm: "R U R' U' R U R'", note: 'A short extraction prevents repeated, wasteful corner turns. Finish with an ordinary pair insert.' },
  { id: 'edge-slot', title: 'Edge in slot, wrong slot', type: 'Edge in slot', cue: 'The target edge is trapped in another slot. Evict it with a simple insertion before pairing.', algorithm: "R U' R' U R U' R'", note: 'First preserve the cross. If the target slot is occupied, choose the other front slot.' },
  { id: 'empty-right', title: 'Empty front-right slot', type: 'Empty slot', cue: 'Use the open slot as a workspace: lift the corner, align the edge, and close the pair.', algorithm: "R U' R' U' F' U F", note: 'The first three moves create room; the F trigger restores the front while inserting.' },
  { id: 'empty-left', title: 'Empty front-left slot', type: 'Empty slot', cue: 'Mirror the right-side empty-slot insertion and keep the pair out of the solved cross.', algorithm: "L' U L U F U' F'", note: 'If left-hand turns feel awkward, rotate the cube and solve the same case on the right.' },
  { id: 'intuitive-open', title: 'Open–pair–insert', type: 'Intuitive', cue: 'Edge and corner are nearby but not paired. Open the slot with R, align their colors, then close.', algorithm: "R U R' U' R U' R'", note: 'Follow the pieces visually; connect the matching colors before the last trigger.' },
  { id: 'intuitive-back', title: 'Back pair, preserve the front', type: 'Intuitive', cue: 'Both pieces are behind the front layer. Use a U setup, then insert from the right.', algorithm: "U2 R U' R' U R U' R'", note: 'Look ahead to the next unsolved corner while the current pair is in the back.' },
  { id: 'pair-left', title: 'Connected pair, front-left', type: 'Connected', cue: 'A ready pair is aligned over the front-left slot. Insert with the mirrored trigger.', algorithm: "U' L' U L", note: 'A left-hand insertion is often faster than rotating the cube away from a good view.' },
];

export const twoLookOll = [
  { title: '1 · Make the top cross', cue: 'Cross already made? Skip ahead. Otherwise orient edges first: Dot → L → line → cross. For the L, hold oriented edges at back and left; hold a line horizontally.', algorithm: "F R U R' U' F'", alternatives: [{ label: 'Dot setup', algorithm: "F U R U' R' F' f R U R' U' f'" }, { label: 'L-shape', algorithm: "F U R U' R' F'" }, { label: 'Line', algorithm: "F R U R' U' F'" }] },
  { title: '2 · Orient the corners', cue: 'With the cross complete, use Sune or anti-Sune to finish the top face. A U adjustment may be needed to align the recognizable fish.', algorithm: "R U R' U R U2 R'", alternatives: [{ label: 'Sune', algorithm: "R U R' U R U2 R'" }, { label: 'Anti-Sune', algorithm: "R U2 R' U' R U' R'" }] },
];

export const twoLookPll = [
  { title: '1 · Permute the corners', cue: 'Use Aa or Ab to cycle three corners; use E when all four corners need a diagonal cycle. Repeat with a U setup until all corner colors match their centers.', algorithm: "x R' U R' D2 R U' R' D2 R2 x'", alternatives: [{ label: 'Aa', algorithm: "x R' U R' D2 R U' R' D2 R2 x'" }, { label: 'Ab', algorithm: "x R2 D2 R U R' D2 R U' R x'" }, { label: 'E', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D' x" }] },
  { title: '2 · Permute the edges', cue: 'After corners are solved, inspect edge cycles. Ua/Ub cycle three edges; H swaps opposite pairs; Z swaps adjacent pairs.', algorithm: "M2 U M U2 M' U M2", alternatives: [{ label: 'Ua', algorithm: "M2 U M U2 M' U M2" }, { label: 'Ub', algorithm: "M2 U' M U2 M' U' M2" }, { label: 'H', algorithm: "M2 U M2 U2 M2 U M2" }, { label: 'Z', algorithm: "M' U' M2 U' M2 U' M' U2 M2" }] },
];
