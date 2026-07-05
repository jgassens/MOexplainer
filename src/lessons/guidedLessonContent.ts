import type { LessonId } from '../content/lessons';
import type { AssessmentItem } from '../components/Assessment';

export type GuidedRestLessonId = Exclude<LessonId, 'phase' | 'combination'>;

export type VisualKind =
  | 'bonding'
  | 'overlap'
  | 'energy-gap'
  | 'polarization'
  | 'ethylene-formaldehyde'
  | 'twist-geometry'
  | 'walsh-geometry'
  | 'pi-chain'
  | 'calculation';

export interface GoingDeeperPanelData {
  title: string;
  body: string;
  terms?: Array<{
    term: string;
    meaning: string;
  }>;
}

export interface LessonStage {
  id: string;
  shortTitle: string;
  title: string;
  lead: string;
  equation: string;
  correction: string;
  goingDeeper?: GoingDeeperPanelData[];
}

export interface GuidedLessonData {
  id: GuidedRestLessonId;
  purpose: string;
  question: string;
  visual: VisualKind;
  stages: LessonStage[];
  checkpointLead: string;
  endLead: string;
  checkpoints: AssessmentItem[];
  endItems: AssessmentItem[];
}

const antibondingEnergyPanel: GoingDeeperPanelData = {
  title: 'Why antibonding is not merely “less bonding”',
  body:
    'The bonding combination is stabilized because electron density accumulates between the nuclei. The antibonding combination is destabilized because destructive interference removes density from that same region and creates a node. In qualitative MO theory, the antibonding destabilization is usually drawn larger than the bonding stabilization. That asymmetry matters when two already-filled orbitals are forced to interact: the net result is repulsive.',
  terms: [
    {
      term: 'closed-shell repulsion',
      meaning: 'The destabilizing four-electron interaction that results when two filled orbitals overlap.',
    },
  ],
};

const energyGapPanel: GoingDeeperPanelData = {
  title: 'First-order and second-order mixing',
  body:
    'Degenerate orbitals mix especially strongly because the starting energy gap is zero. Unequal-energy orbitals still mix, but the interaction is weaker as the gap grows. This is the energy-gap rule. It is enough for most qualitative organic arguments: good overlap and small energy gap produce strong mixing; poor overlap or a large gap produce weak mixing.',
  terms: [
    { term: 'degenerate', meaning: 'Having the same energy.' },
    { term: 'second-order mixing', meaning: 'Mixing between orbitals that begin at different energies.' },
  ],
};

const carbonylPolarizationPanel: GoingDeeperPanelData = {
  title: 'Coefficient, density, and charge are related but not identical',
  body:
    'A large orbital coefficient means that the orbital has a large contribution from that atom or fragment. Electron density depends on occupied orbitals. Charge distribution depends on all occupied orbitals and the nuclei. For carbonyls, the key qualitative result is that the occupied π orbital is more oxygen-like, while the empty π* orbital has a larger carbon coefficient.',
  terms: [
    { term: 'coefficient', meaning: 'The weight of an atomic or group orbital inside a molecular orbital.' },
  ],
};

const walshPanel: GoingDeeperPanelData = {
  title: 'Walsh diagrams connect shape to occupancy',
  body:
    'A Walsh diagram tracks how orbital energies change as geometry changes. It becomes useful only after electrons are placed into the orbitals. An empty orbital can fall in energy without stabilizing the ground-state molecule; an occupied orbital that falls can drive a geometry preference.',
  terms: [
    { term: 'Walsh diagram', meaning: 'A diagram of orbital energies as a function of molecular geometry.' },
    { term: 'virtual orbital', meaning: 'An orbital present in the diagram but unoccupied for the electron count being considered.' },
  ],
};

const groupOrbitalPanel: GoingDeeperPanelData = {
  title: 'Group orbitals are transferable patterns, not isolated pieces',
  body:
    'A group orbital is a recurring orbital pattern associated with a molecular fragment or functional group. It is not literally an unchanged orbital floating inside the larger molecule. The useful claim is weaker and more practical: the recognizable pattern survives enough to guide structure and reactivity arguments.',
  terms: [
    { term: 'group orbital', meaning: 'A transferable MO pattern associated with a fragment or functional group.' },
  ],
};

const calculatedSurfacePanel: GoingDeeperPanelData = {
  title: 'Computed orbital surfaces are drawings of a chosen contour',
  body:
    'A rendered orbital is often an isosurface: a surface drawn where the orbital amplitude reaches a selected value. Changing the contour value can change how fat or thin the surface looks. The robust comparison is not decorative shape; it is node pattern, relative phase, coefficient pattern, and localization.',
  terms: [
    { term: 'isosurface', meaning: 'A surface drawn at one selected value of a function.' },
  ],
};

const bondingItems: AssessmentItem[] = [
  {
    id: 'bond-node-choice',
    type: 'choice',
    prompt: 'Two p orbitals overlap with opposite signs in the internuclear region. What feature must appear in the resulting MO?',
    target: 'Distinguish destructive overlap from constructive overlap.',
    choices: [
      { id: 'A', text: 'A node between the nuclei and reduced electron density there' },
      { id: 'B', text: 'Extra electron density between the nuclei' },
      { id: 'C', text: 'A positive charge between the nuclei' },
      { id: 'D', text: 'No change, because phase has no chemical consequence' },
    ],
    correctChoiceId: 'A',
    feedback: 'Opposite signs cancel in the overlap region. That cancellation creates a node and gives antibonding character.',
    modelAnswer:
      'Opposite phase produces destructive overlap in the internuclear region. The resulting node removes density from the region that would otherwise stabilize the two nuclei.',
    rubric: ['Identifies a node', 'Connects opposite phase to cancellation', 'Connects lost internuclear density to antibonding character'],
  },
  {
    id: 'bond-energy-short',
    type: 'short',
    prompt: 'Explain why the bonding MO is lower in energy than the antibonding MO.',
    target: 'Connect phase, density between nuclei, and relative energy.',
    feedback: 'A strong answer mentions in-phase addition, density between nuclei, and the antibonding node.',
    modelAnswer:
      'In the bonding combination, same-phase amplitudes add between the nuclei, so occupied electron density helps bind the nuclei. In the antibonding combination, opposite phases cancel between the nuclei, creating a node and a higher-energy orbital.',
    rubric: ['Mentions in-phase addition', 'Mentions density buildup between nuclei', 'Compares with antibonding cancellation or node'],
  },
];

const overlapItems: AssessmentItem[] = [
  {
    id: 'overlap-distance-choice',
    type: 'choice',
    prompt: 'At fixed phase and orbital type, what happens when two interacting orbitals are pulled farther apart?',
    target: 'Apply the overlap rule.',
    choices: [
      { id: 'A', text: 'Useful overlap decreases and the energy splitting becomes smaller' },
      { id: 'B', text: 'Useful overlap increases and the energy splitting becomes larger' },
      { id: 'C', text: 'The bonding orbital becomes antibonding automatically' },
      { id: 'D', text: 'The sign of both orbitals must flip' },
    ],
    correctChoiceId: 'A',
    feedback: 'Larger spatial overlap gives a larger interaction. More separation lowers the overlap.',
    modelAnswer:
      'As the orbitals separate, they occupy less of the same space. The overlap and the bonding/antibonding splitting both decrease.',
    rubric: ['Predicts decreased overlap', 'Connects overlap to splitting', 'Does not confuse distance with phase'],
  },
  {
    id: 'overlap-geometry-short',
    type: 'short',
    prompt: 'Name one structural change in a real molecule that would improve useful orbital overlap and explain why.',
    target: 'Transfer the slider model to molecular geometry.',
    feedback: 'Good answers use distance, alignment, or orbital directionality.',
    modelAnswer:
      'Shortening the interacting distance or aligning two p orbitals parallel to each other improves overlap. A hybrid orbital pointing along a bond axis can also improve sigma overlap.',
    rubric: ['Names a structural change', 'Connects it to shared space or alignment', 'States the chemical consequence'],
  },
];

const energyGapItems: AssessmentItem[] = [
  {
    id: 'gap-choice',
    type: 'choice',
    prompt: 'Two orbitals have good overlap. Which starting-energy situation gives the strongest mixing?',
    target: 'Apply the energy-gap rule.',
    choices: [
      { id: 'A', text: 'The orbitals begin close in energy' },
      { id: 'B', text: 'The orbitals begin very far apart in energy' },
      { id: 'C', text: 'The lower orbital is already full' },
      { id: 'D', text: 'The higher orbital has more nodes' },
    ],
    correctChoiceId: 'A',
    feedback: 'Small starting energy gaps produce stronger mixing, assuming useful overlap is present.',
    modelAnswer:
      'Orbitals that begin close in energy mix strongly. When the starting gap is large, the resulting orbitals remain mostly like the starting orbitals closest to them in energy.',
    rubric: ['Identifies small gap', 'Mentions overlap still matters', 'Connects gap size to extent of mixing'],
  },
  {
    id: 'gap-polarization-short',
    type: 'short',
    prompt: 'When two unequal-energy orbitals mix, why is the lower resulting MO more like the lower-energy starting orbital?',
    target: 'Explain orbital character after unequal-energy mixing.',
    feedback: 'Use character language: lower keeps more lower-energy character; upper keeps more higher-energy character.',
    modelAnswer:
      'The lower MO retains the larger contribution from the lower-energy starting orbital and mixes in some of the higher orbital in a bonding way. The upper MO retains more of the higher-energy starting orbital and mixes in the lower one antibonding.',
    rubric: ['Recognizes unequal starting energies', 'Correctly assigns lower MO character', 'Correctly assigns upper MO character'],
  },
];

const polarizationItems: AssessmentItem[] = [
  {
    id: 'polarization-choice',
    type: 'choice',
    prompt: 'In a C=O π system, which statement best describes the π and π* polarizations?',
    target: 'Predict carbonyl orbital polarization from lower oxygen orbital energy.',
    choices: [
      { id: 'A', text: 'The occupied π MO is more oxygen-like; the π* LUMO has a larger carbon coefficient' },
      { id: 'B', text: 'Both π and π* are more oxygen-like' },
      { id: 'C', text: 'Both π and π* are more carbon-like' },
      { id: 'D', text: 'C=O orbitals are unpolarized because C and O both use p orbitals' },
    ],
    correctChoiceId: 'A',
    feedback: 'Oxygen contributes lower-energy p orbitals. The lower MO leans toward oxygen, and the higher antibonding MO has larger carbon character.',
    modelAnswer:
      'The bonding π orbital is lower and more oxygen-like, while the antibonding π* orbital is higher and has the larger coefficient on carbon.',
    rubric: ['Places occupied π character toward oxygen', 'Places π* coefficient toward carbon', 'Connects to electronegativity or orbital energy'],
  },
  {
    id: 'polarization-reactivity-short',
    type: 'short',
    prompt: 'Use the carbonyl π* picture to explain why a nucleophile approaches the carbon atom rather than oxygen.',
    target: 'Connect orbital coefficient to reactivity.',
    feedback: 'The key is the LUMO coefficient. Nucleophiles donate from filled orbitals into an empty acceptor orbital.',
    modelAnswer:
      'A nucleophile donates into the carbonyl π* LUMO. That LUMO is polarized with the larger coefficient on carbon, so overlap with the nucleophile is strongest at carbon.',
    rubric: ['Names π* or LUMO', 'Mentions larger carbon coefficient', 'Connects filled nucleophile orbital to empty acceptor orbital'],
  },
];

const ethyleneFormaldehydeItems: AssessmentItem[] = [
  {
    id: 'ef-compare-choice',
    type: 'choice',
    prompt: 'Why is ethylene a useful comparison molecule for formaldehyde?',
    target: 'Recognize an analogous orbital framework perturbed by oxygen.',
    choices: [
      { id: 'A', text: 'They have analogous valence-orbital patterns, but oxygen lowers and polarizes the C=O orbitals' },
      { id: 'B', text: 'They have identical orbital energies and identical reactivity' },
      { id: 'C', text: 'Ethylene contains two lone pairs like formaldehyde' },
      { id: 'D', text: 'Formaldehyde has no π system' },
    ],
    correctChoiceId: 'A',
    feedback: 'The useful comparison is controlled perturbation: replace one CH2 fragment with oxygen and track the consequences.',
    modelAnswer:
      'Ethylene and formaldehyde have analogous π frameworks. Replacing CH2 with oxygen lowers the oxygen orbital energies, polarizing the bonding π orbital toward oxygen and the π* orbital toward carbon.',
    rubric: ['Mentions analogous π framework', 'Identifies oxygen as perturbation', 'States at least one polarization consequence'],
  },
  {
    id: 'ef-lonepair-short',
    type: 'short',
    prompt: 'Why is it incomplete to say that formaldehyde is just ethylene with one carbon replaced by oxygen?',
    target: 'Account for lone-pair-type orbitals and polarization.',
    feedback: 'The analogy is useful, but oxygen adds lower-energy orbitals and occupied lone-pair-type MOs.',
    modelAnswer:
      'The π framework is analogous, but oxygen changes the starting orbital energies and introduces occupied lone-pair-type orbitals. Those changes alter HOMO/LUMO identity and reactivity.',
    rubric: ['Uses the ethylene analogy', 'Adds oxygen-energy or lone-pair qualification', 'Mentions reactivity or frontier-orbital consequence'],
  },
];

const twistGeometryItems: AssessmentItem[] = [
  {
    id: 'twist-choice',
    type: 'choice',
    prompt: 'What happens to π overlap as two neighboring p orbitals are twisted from coplanar toward perpendicular?',
    target: 'Connect torsion angle to π overlap.',
    choices: [
      { id: 'A', text: 'π overlap decreases and approaches zero near 90°' },
      { id: 'B', text: 'π overlap increases because the orbitals avoid each other' },
      { id: 'C', text: 'Only σ overlap changes' },
      { id: 'D', text: 'The phase labels become meaningless' },
    ],
    correctChoiceId: 'A',
    feedback: 'Parallel p orbitals overlap well. Perpendicular p orbitals have nearly zero useful π overlap.',
    modelAnswer:
      'As the twist angle approaches 90°, the p orbitals stop sharing the correct region of space, so useful π overlap and π delocalization collapse.',
    rubric: ['Identifies decreased π overlap', 'Mentions perpendicular or 90° limit', 'Connects to delocalization or interaction strength'],
  },
  {
    id: 'twist-transfer-short',
    type: 'short',
    prompt: 'Explain why conjugated π systems tend to prefer geometries that keep p orbitals aligned.',
    target: 'Transfer the twist visual to conjugation.',
    feedback: 'The answer should connect alignment to delocalization and stabilization.',
    modelAnswer:
      'Aligned p orbitals can mix across adjacent atoms, allowing electron density to delocalize over a larger π system. Twisting breaks that overlap and removes the stabilizing interaction.',
    rubric: ['Names p-orbital alignment', 'Mentions delocalization', 'Connects delocalization to stabilization'],
  },
];

const walshGeometryItems: AssessmentItem[] = [
  {
    id: 'walsh-occupancy-choice',
    type: 'choice',
    prompt: 'In an MH3 Walsh diagram, why does NH3 prefer a pyramidal geometry while BH3 prefers planar geometry?',
    target: 'Use electron count and orbital occupancy.',
    choices: [
      { id: 'A', text: 'NH3 occupies an orbital stabilized by pyramidalization; BH3 does not' },
      { id: 'B', text: 'Nitrogen is larger than boron' },
      { id: 'C', text: 'BH3 has more electrons than NH3' },
      { id: 'D', text: 'All MH3 molecules must be pyramidal' },
    ],
    correctChoiceId: 'A',
    feedback: 'The same qualitative orbital diagram can give different geometry preferences after the electrons are placed into it.',
    modelAnswer:
      'NH3 has enough electrons to occupy the orbital that is strongly stabilized on pyramidalization. BH3 lacks those electrons, so that stabilization does not control its ground-state geometry.',
    rubric: ['Compares electron counts', 'Mentions occupied stabilized orbital', 'Correctly assigns NH3 and BH3 preferences'],
  },
  {
    id: 'walsh-intermediate-short',
    type: 'short',
    prompt: 'Use occupancy of the key orbital to compare a carbocation, radical, and carbanion in the methyl framework.',
    target: 'Apply Walsh reasoning to reactive intermediates.',
    feedback: 'Empty, singly occupied, and doubly occupied frontier orbitals lead to different geometry preferences.',
    modelAnswer:
      'A methyl cation has the key p-like orbital empty, so pyramidalization does not gain that occupancy stabilization and the planar form is favored. A methyl anion has the corresponding orbital occupied as a lone pair, so pyramidalization is favored. A radical is intermediate because the orbital is singly occupied.',
    rubric: ['Identifies cation as empty', 'Identifies anion as doubly occupied', 'Explains radical as intermediate or weakly biased'],
  },
];

const piChainItems: AssessmentItem[] = [
  {
    id: 'chain-count-choice',
    type: 'choice',
    prompt: 'A linear chain of five aligned p orbitals produces how many π MOs?',
    target: 'Apply conservation of orbitals.',
    choices: [
      { id: 'A', text: 'Five' },
      { id: 'B', text: 'Four' },
      { id: 'C', text: 'Six' },
      { id: 'D', text: 'Ten' },
    ],
    correctChoiceId: 'A',
    feedback: 'The number of molecular orbitals equals the number of starting orbitals.',
    modelAnswer: 'Five starting p orbitals produce five π molecular orbitals.',
    rubric: ['Counts starting p orbitals', 'Conserves orbital number', 'Does not count electrons instead of orbitals'],
  },
  {
    id: 'chain-node-short',
    type: 'short',
    prompt: 'Explain how node count helps rank the π MOs of one conjugated chain.',
    target: 'Connect node count to relative orbital energy.',
    feedback: 'Within a related set, more internal nodes generally means higher energy.',
    modelAnswer:
      'The lowest π MO has the fewest internal nodes. Higher-energy π MOs introduce more sign changes and nodes, so node count can rank the MOs within the same conjugated system.',
    rubric: ['States fewer nodes lower', 'States more nodes higher', 'Limits the claim to a related set of orbitals'],
  },
];

const calculationItems: AssessmentItem[] = [
  {
    id: 'calc-feature-choice',
    type: 'choice',
    prompt: 'Which feature is most chemically robust when comparing a qualitative orbital cartoon with a computed orbital rendering?',
    target: 'Focus on meaningful orbital features rather than decorative surface details.',
    choices: [
      { id: 'A', text: 'Node pattern, relative phase, and coefficient/localization pattern' },
      { id: 'B', text: 'The exact thickness of every rendered lobe' },
      { id: 'C', text: 'The screen color alone' },
      { id: 'D', text: 'The absolute pixel size of the orbital picture' },
    ],
    correctChoiceId: 'A',
    feedback: 'Rendered surfaces depend on display choices. Nodes, phase relationships, and coefficient patterns carry the chemistry.',
    modelAnswer:
      'The durable comparison is whether the computed orbital preserves the predicted nodes, phase relationships, and coefficient or localization pattern.',
    rubric: ['Names nodes', 'Names phase or sign', 'Names coefficient/localization rather than display size'],
  },
  {
    id: 'calc-transfer-short',
    type: 'short',
    prompt: 'How can a calculated orbital for a larger molecule still support a group-orbital explanation?',
    target: 'Connect computed output to transferable group-orbital reasoning.',
    feedback: 'The answer should say that the pattern is modified but still recognizable.',
    modelAnswer:
      'A larger molecule changes the exact orbital shape, but a carbonyl π* or alkene π pattern can remain recognizable. That recognizable fragment pattern supports a group-orbital explanation of structure or reactivity.',
    rubric: ['Mentions larger-molecule modification', 'Mentions recognizable group pattern', 'Connects to structure or reactivity reasoning'],
  },
];

export const guidedLessonContent: Record<GuidedRestLessonId, GuidedLessonData> = {
  bonding: {
    id: 'bonding',
    purpose: 'Use the chapter’s orbital-mixing picture to turn signed addition into bonding, antibonding, nodes, and electron-count consequences.',
    question: 'When two p orbitals mix, how do the signs at the bond center control density, nodes, and whether the interaction stabilizes the molecule?',
    visual: 'bonding',
    checkpointLead: 'Use the workbench to compare ψ+ and ψ−. Watch the bond-center addition, density readout, node, and energy pair before answering.',
    endLead: 'Submit an explanation that links signed addition, node formation, orbital count, and electron occupancy. No answer key is exported.',
    stages: [
      {
        id: 'in-phase',
        shortTitle: 'Add signs',
        title: 'The bond center is a signed-addition test',
        lead: 'Look only at the region between the two nuclei. If the two starting orbitals have the same sign there, their ψ values add. If they have opposite signs there, their ψ values cancel.',
        equation: 'ψ+ = φA + φB; ψ− = φA − φB',
        correction: 'Do not read + and − as charge. They are the signs of wave amplitude at the same point in space.',
      },
      {
        id: 'out-of-phase',
        shortTitle: 'Square ψ',
        title: 'Density or a node appears only after the addition',
        lead: 'The MO is built by adding ψ values first. Then squaring the resulting ψ gives density. Constructive addition gives density between nuclei; destructive addition gives ψ = 0 and therefore a node.',
        equation: 'same signs -> |large ψ|²; opposite signs -> |0|²',
        correction: 'Do not skip straight to density. The node comes from cancellation of signed wave amplitudes before squaring.',
      },
      {
        id: 'energy-pair',
        shortTitle: 'Occupy pair',
        title: 'Electron occupancy decides whether the pair helps or hurts',
        lead: 'Two starting orbitals make two MOs: a lower bonding MO and a higher antibonding MO. With two electrons, only the lower MO is occupied. With four electrons, both are occupied, and the antibonding penalty is larger.',
        equation: '2 AOs -> ψ+ lower + ψ− higher',
        correction: 'Do not call every orbital interaction stabilizing. Filled-filled mixing can be repulsive because the antibonding rise is larger.',
        goingDeeper: [antibondingEnergyPanel],
      },
    ],
    checkpoints: bondingItems,
    endItems: [
      ...bondingItems,
      {
        id: 'bond-transfer-short',
        type: 'short',
        prompt: 'Apply the same reasoning to a σ bond made from two hybrid orbitals. What changes and what stays the same?',
        target: 'Transfer bonding/antibonding logic from p orbitals to σ overlap.',
        feedback: 'The geometry changes, but addition, subtraction, phase, node formation, and conservation of orbitals remain the same.',
        modelAnswer:
          'Hybrid orbitals point along the bond axis rather than above and below it, but same-phase overlap still gives a σ bonding MO and opposite-phase overlap gives a σ* antibonding MO with a node between nuclei.',
        rubric: ['Mentions σ overlap along bond axis', 'Preserves same/opposite phase logic', 'Mentions σ* node or antibonding partner'],
      },
    ],
  },
  overlap: {
    id: 'overlap',
    purpose: 'Make orbital overlap concrete: orbitals must occupy the same region of space with the right relative phase to interact strongly.',
    question: 'Why do distance, size, and orientation change the strength of an orbital interaction?',
    visual: 'overlap',
    checkpointLead: 'Move the distance and spread sliders, then predict how the interaction changes.',
    endLead: 'Submit a geometry-to-overlap explanation. No answer key is exported.',
    stages: [
      {
        id: 'space',
        shortTitle: 'Same space',
        title: 'Overlap means occupying the same region of space',
        lead: 'Two orbitals interact strongly only when they share space. Pulling them apart decreases the common region and decreases the interaction.',
        equation: 'larger shared region -> larger interaction',
        correction: 'A large orbital drawn on a screen is not automatically a strong interaction; the shared region is what matters.',
      },
      {
        id: 'signed',
        shortTitle: 'Signed overlap',
        title: 'Phase decides whether shared space is useful',
        lead: 'Shared space with the same sign contributes constructively. Shared space with opposite signs cancels and contributes destructively.',
        equation: 'useful overlap depends on sign and size',
        correction: 'Color is not the evidence. The visible + and − signs are the evidence.',
      },
      {
        id: 'geometry',
        shortTitle: 'Geometry',
        title: 'Geometry can increase or destroy overlap',
        lead: 'Shorter distances, better alignment, and orbitals pointing toward each other generally increase overlap. Orthogonal orbitals generally fail to overlap usefully.',
        equation: 'structure -> overlap -> interaction strength',
        correction: 'Do not invoke overlap as a magic word. Say which orbitals overlap and how geometry changes that overlap.',
      },
    ],
    checkpoints: overlapItems,
    endItems: overlapItems,
  },
  'energy-gap': {
    id: 'energy-gap',
    purpose: 'Add the second control variable for orbital mixing: the starting energy gap between the orbitals.',
    question: 'Why do close-in-energy orbitals mix more strongly than orbitals far apart in energy?',
    visual: 'energy-gap',
    checkpointLead: 'Move the energy-gap slider while keeping overlap similar. Watch the orbital character percentages.',
    endLead: 'Submit an energy-gap explanation that distinguishes overlap from starting orbital energy. No answer key is exported.',
    stages: [
      {
        id: 'close',
        shortTitle: 'Close energies',
        title: 'Close starting energies mix strongly',
        lead: 'When two orbitals begin near the same energy and have useful overlap, the resulting MOs are strong mixtures of both starting orbitals.',
        equation: 'small ΔE + good overlap -> strong mixing',
        correction: 'Small energy gap alone is not enough. The orbitals still need useful overlap.',
        goingDeeper: [energyGapPanel],
      },
      {
        id: 'far',
        shortTitle: 'Large gap',
        title: 'Large starting gaps leave orbitals mostly unmixed',
        lead: 'When the starting energy gap is large, the lower resulting MO remains mostly like the lower starting orbital and the upper one remains mostly like the higher starting orbital.',
        equation: 'large ΔE -> weak mixing',
        correction: 'Weak mixing is not zero mixing. It is small enough that the starting character mostly survives.',
      },
      {
        id: 'polarized',
        shortTitle: 'Character',
        title: 'Unequal-energy mixing polarizes the resulting MOs',
        lead: 'The lower MO takes more character from the lower-energy starting orbital. The upper MO takes more character from the higher-energy starting orbital.',
        equation: 'unequal energies -> unequal coefficients',
        correction: 'Do not assume both atoms contribute equally just because both supply p orbitals.',
      },
    ],
    checkpoints: energyGapItems,
    endItems: energyGapItems,
  },
  polarization: {
    id: 'polarization',
    purpose: 'Use electronegativity as an orbital-energy argument, not just as a partial-charge slogan.',
    question: 'How does lowering one atom’s orbital energy polarize both the bonding and antibonding MOs?',
    visual: 'polarization',
    checkpointLead: 'Compare C=C, C=N, and C=O. Track which MO becomes oxygen-like and which becomes carbon-like.',
    endLead: 'Submit a carbonyl-polarization explanation. No answer key is exported.',
    stages: [
      {
        id: 'lower-energy',
        shortTitle: 'Lower AO',
        title: 'Electronegative atoms contribute lower-energy orbitals',
        lead: 'Oxygen p orbitals begin lower in energy than carbon p orbitals. That starting-energy difference is enough to polarize the resulting π and π* MOs.',
        equation: 'more electronegative atom -> lower-energy AO',
        correction: 'Do not reduce this to “oxygen is negative.” The MO argument starts with orbital energy.',
      },
      {
        id: 'lower-mo',
        shortTitle: 'π orbital',
        title: 'The lower π MO becomes more heteroatom-like',
        lead: 'In a carbonyl-like system, the occupied bonding π orbital has more contribution from the lower-energy oxygen orbital.',
        equation: 'lower MO -> more lower-energy character',
        correction: 'A drawn lobe may be smaller for oxygen because oxygen is smaller. Coefficient and display size are not the same thing.',
        goingDeeper: [carbonylPolarizationPanel],
      },
      {
        id: 'upper-mo',
        shortTitle: 'π* orbital',
        title: 'The antibonding π* MO has larger carbon character',
        lead: 'The higher π* orbital keeps more character from the higher-energy carbon orbital. That is why carbonyl π* is the acceptor orbital at carbon.',
        equation: 'upper MO -> more higher-energy character',
        correction: 'Do not explain nucleophilic addition only with δ+ and δ−. The LUMO coefficient gives the orbital reason.',
      },
    ],
    checkpoints: polarizationItems,
    endItems: polarizationItems,
  },
  'ethylene-formaldehyde': {
    id: 'ethylene-formaldehyde',
    purpose: 'Use ethylene as the symmetric reference and formaldehyde as the heteroatom-perturbed case.',
    question: 'What is preserved and what changes when one side of an ethylene-like π system becomes oxygen?',
    visual: 'ethylene-formaldehyde',
    checkpointLead: 'Toggle between ethylene and formaldehyde. Identify which claims survive and which change.',
    endLead: 'Submit a comparison that uses the ethylene reference without pretending formaldehyde is identical. No answer key is exported.',
    stages: [
      {
        id: 'ethylene',
        shortTitle: 'Reference',
        title: 'Ethylene gives the clean equal-energy π/π* pattern',
        lead: 'In ethylene, the two carbon p orbitals begin equivalent. The bonding and antibonding π orbitals are therefore symmetric in their carbon contributions.',
        equation: 'C p + C p -> π and π*',
        correction: 'Ethylene is a reference case, not the universal case.',
      },
      {
        id: 'formaldehyde',
        shortTitle: 'Perturb',
        title: 'Formaldehyde keeps the pattern but polarizes it',
        lead: 'Formaldehyde is useful because the framework is analogous but not identical. Oxygen lowers one side of the system, changing the orbital energies and coefficients.',
        equation: 'C p + O p -> polarized π and π*',
        correction: 'Do not say C=O has no π system. It has a polarized π system.',
      },
      {
        id: 'lone-pairs',
        shortTitle: 'Lone pairs',
        title: 'The MO picture also contains lone-pair-type orbitals',
        lead: 'Formaldehyde has occupied orbitals with lone-pair character on oxygen. That matters when deciding what the HOMO is and where protonation is expected.',
        equation: 'carbonyl MOs include π, π*, and lone-pair-type orbitals',
        correction: 'Do not assume the π orbital is always the HOMO just because it is familiar from ethylene.',
      },
    ],
    checkpoints: ethyleneFormaldehydeItems,
    endItems: ethyleneFormaldehydeItems,
  },
  geometry: {
    id: 'geometry',
    purpose: 'Keep Lesson 8 focused on the existing twist-angle lesson: geometry controls π overlap by controlling alignment.',
    question: 'Why does twisting a π system reduce orbital overlap and interrupt delocalization?',
    visual: 'twist-geometry',
    checkpointLead: 'Twist the model from 0° toward 90° and predict when π overlap disappears.',
    endLead: 'Submit a twist-angle explanation tied to π overlap. No answer key is exported.',
    stages: [
      {
        id: 'aligned',
        shortTitle: 'Aligned p orbitals',
        title: 'Aligned neighboring p orbitals communicate strongly',
        lead: 'A conjugated π system depends on neighboring p orbitals being aligned. When the lobes are parallel, the orbitals can mix across the bond.',
        equation: 'parallel p orbitals -> useful π overlap',
        correction: 'Do not treat a drawn double bond as enough. The p orbitals must be geometrically aligned.',
      },
      {
        id: 'twist',
        shortTitle: 'Twist',
        title: 'Twisting removes useful overlap',
        lead: 'As the torsion angle grows, the p orbitals share less useful space. Near 90°, the π interaction approaches zero in the simple model.',
        equation: 'π overlap scales with alignment',
        correction: 'Twisting does not delete the p orbitals. It prevents them from interacting effectively.',
      },
      {
        id: 'delocalization',
        shortTitle: 'Delocalize',
        title: 'Planarity lets a π system delocalize',
        lead: 'Planar or near-planar π systems allow orbital mixing over multiple atoms. Twisting localizes the system by weakening the connection.',
        equation: 'alignment -> delocalization -> stabilization',
        correction: 'Do not use “resonance” as a drawing rule only. It has an orbital-overlap condition.',
      },
    ],
    checkpoints: twistGeometryItems,
    endItems: twistGeometryItems,
  },
  'walsh-geometry': {
    id: 'walsh-geometry',
    purpose: 'Add the geometry/electron-count lesson as a new Lesson 9 rather than replacing the twist-overlap lesson.',
    question: 'How can the same orbital framework give different shapes after electrons are placed into it?',
    visual: 'walsh-geometry',
    checkpointLead: 'Change the distortion and electron count. Track which occupied orbitals rise or fall.',
    endLead: 'Submit a Walsh-style electron-count explanation. No answer key is exported.',
    stages: [
      {
        id: 'walsh',
        shortTitle: 'Track energy',
        title: 'A Walsh diagram follows orbital energies during distortion',
        lead: 'Start from a high-symmetry geometry, distort it, and track which orbitals rise or fall. The diagram becomes chemically useful when the orbitals are occupied.',
        equation: 'geometry -> overlap changes -> orbital-energy changes',
        correction: 'Do not pick the geometry first and explain it afterward. Let occupancy decide the preference.',
        goingDeeper: [walshPanel],
      },
      {
        id: 'mh3',
        shortTitle: 'MH3 count',
        title: 'The MH3 framework changes when the key orbital is occupied',
        lead: 'BH3 has six valence electrons and remains planar. NH3 has eight and uses the stabilized orbital in the pyramidal form.',
        equation: 'occupied stabilized orbital favors distortion',
        correction: 'The orbital framework is similar; the electron count changes the shape preference.',
      },
      {
        id: 'intermediates',
        shortTitle: 'Intermediates',
        title: 'Reactive intermediates are electron-count tests of the same picture',
        lead: 'Carbocations, radicals, carbanions, and carbenes differ because the crucial orbital is empty, singly occupied, or doubly occupied.',
        equation: 'empty / singly occupied / doubly occupied -> different geometry preferences',
        correction: 'Do not memorize planar or pyramidal as labels. Ask which orbital is occupied.',
      },
    ],
    checkpoints: walshGeometryItems,
    endItems: [
      ...walshGeometryItems,
      {
        id: 'walsh-carbene-short',
        type: 'short',
        prompt: 'Use the CH2 Walsh picture to explain why singlet and triplet carbenes can have different bond angles.',
        target: 'Transfer Walsh reasoning to carbenes.',
        feedback: 'The answer should mention paired versus unpaired occupancy of the two frontier orbitals.',
        modelAnswer:
          'In CH2, bending opens a gap between the relevant frontier orbitals. A singlet can pair both electrons in the lower orbital at a smaller angle, while a triplet keeps one electron in each orbital and favors a wider angle.',
        rubric: ['Mentions singlet/triplet occupancy', 'Mentions bending or angle change', 'Connects occupancy to energy preference'],
      },
    ],
  },
  'pi-chain': {
    id: 'pi-chain',
    purpose: 'Build longer π systems from the same add/subtract logic used in Lessons 1 and 2.',
    question: 'How do node count and phase pattern organize the π orbitals of allyl, butadiene, benzene, and longer chains?',
    visual: 'pi-chain',
    checkpointLead: 'Change the number of p orbitals and predict the node count before selecting the MO.',
    endLead: 'Submit a node-count and coefficient-pattern explanation. No answer key is exported.',
    stages: [
      {
        id: 'count',
        shortTitle: 'N orbitals',
        title: 'N p orbitals make N π MOs',
        lead: 'Conservation of orbitals is simple: a chain of N p orbitals produces N π molecular orbitals.',
        equation: 'N AOs -> N MOs',
        correction: 'Do not create or destroy orbitals. Mixing reorganizes the starting set.',
      },
      {
        id: 'nodes',
        shortTitle: 'Nodes rank',
        title: 'More nodes generally means higher energy',
        lead: 'The lowest π MO has the fewest nodes. Higher π MOs introduce more sign changes and more internal nodes.',
        equation: 'node count increases with energy',
        correction: 'Node count ranks orbitals within a related set. It is not a universal energy scale across unrelated molecules.',
      },
      {
        id: 'frontier',
        shortTitle: 'Coefficients',
        title: 'Some atoms can sit on nodes or have small coefficients',
        lead: 'In allyl and benzyl systems, the frontier orbital can have zero or small coefficients at specific atoms. That explains where charge or radical character appears in resonance pictures.',
        equation: 'small coefficient -> little frontier-orbital character at that atom',
        correction: 'A resonance structure is a bookkeeping picture; the orbital coefficient gives the visual MO reason.',
        goingDeeper: [groupOrbitalPanel],
      },
    ],
    checkpoints: piChainItems,
    endItems: [
      ...piChainItems,
      {
        id: 'chain-allyl-transfer-short',
        type: 'short',
        prompt: 'In the allyl frontier orbital, why does the central atom have little or no coefficient in the simple model?',
        target: 'Connect node placement to resonance patterns in allyl systems.',
        feedback: 'The middle MO of allyl has a node through the central atom in the simple model.',
        modelAnswer:
          'The allyl frontier orbital has a sign change across the central atom, placing a node there in the simple model. Therefore the terminal atoms carry most of the frontier-orbital character, matching the usual resonance pattern.',
        rubric: ['Mentions central node or zero coefficient', 'Identifies terminal atoms as major contributors', 'Connects to resonance or charge/radical distribution'],
      },
    ],
  },
  calculation: {
    id: 'calculation',
    purpose: 'Use computed MOs as a reality check on the qualitative model without turning the lesson into a computational chemistry course.',
    question: 'What should a student look for when a calculated orbital is compared with a qualitative MO cartoon?',
    visual: 'calculation',
    checkpointLead: 'Pick a feature in the qualitative cartoon, then check whether the calculated-style picture preserves it.',
    endLead: 'Submit a transfer explanation that compares a qualitative cartoon with a calculated-style orbital. No answer key is exported.',
    stages: [
      {
        id: 'features',
        shortTitle: 'Features',
        title: 'Compare features, not decorative surfaces',
        lead: 'The meaningful comparison is nodal pattern, phase pattern, coefficient size, and localization. The exact contour surface depends on calculation and display settings.',
        equation: 'qualitative model -> nodes, phase, coefficients, symmetry',
        correction: 'Do not grade the cartoon by whether it looks exactly like a rendered surface.',
        goingDeeper: [calculatedSurfacePanel],
      },
      {
        id: 'transfer',
        shortTitle: 'Transfer',
        title: 'Group orbitals make larger molecules manageable',
        lead: 'Functional groups contribute recognizable orbitals. A carbonyl π* or alkene π orbital remains useful inside a larger molecule, although it is modified by the rest of the structure.',
        equation: 'functional group -> transferable orbital pattern',
        correction: 'A group orbital is a model, not an isolated molecule floating inside the larger molecule.',
      },
      {
        id: 'limits',
        shortTitle: 'Limits',
        title: 'Know what the model does not claim',
        lead: 'The app uses scaled teaching energies. It is designed for qualitative reasoning, not numerical prediction of orbital energies or reaction barriers.',
        equation: 'teaching units != experimental energies',
        correction: 'A good qualitative model is useful because it predicts trends and explanations, not because it gives exact numbers.',
      },
    ],
    checkpoints: calculationItems,
    endItems: calculationItems,
  },
};
