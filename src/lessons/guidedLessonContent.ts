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

const phaseTermPanel: GoingDeeperPanelData = {
  title: 'Phase is always shown by sign, not color alone',
  body: 'The two lobe colors are only a visual aid. The + and − labels are the actual phase information in this app. If a color palette changes or a figure is printed in grayscale, the phase logic should still be readable.',
  terms: [
    { term: 'phase', meaning: 'The sign of the orbital wave amplitude in a region of space.' },
    { term: 'node', meaning: 'A surface where the wave amplitude is zero.' },
  ],
};

const bondingItems: AssessmentItem[] = [
  {
    id: 'bond-node-choice',
    type: 'choice',
    prompt: 'Two p orbitals face each other with opposite signs in the internuclear region. What feature must appear in the resulting MO?',
    target: 'Distinguish antibonding cancellation from bonding reinforcement.',
    choices: [
      { id: 'A', text: 'A node between the nuclei and reduced density there' },
      { id: 'B', text: 'Extra density between the nuclei' },
      { id: 'C', text: 'Positive charge between the nuclei' },
      { id: 'D', text: 'No change because phase has no consequence' },
    ],
    correctChoiceId: 'A',
    feedback: 'Opposite signs cancel in the overlap region. That cancellation creates a nodal surface and raises the antibonding MO in energy.',
    modelAnswer: 'Opposite phase gives destructive overlap. The internuclear region has a node, so density is removed from the region that would otherwise bind the atoms.',
    rubric: ['Names the node', 'Connects opposite phase to cancellation', 'Connects density removal to antibonding character'],
  },
  {
    id: 'bonding-energy-short',
    type: 'short',
    prompt: 'Explain why the bonding MO is lower in energy than the antibonding MO using density between the nuclei.',
    target: 'Use the visual model to connect phase, density, and relative orbital energy.',
    feedback: 'A strong answer mentions in-phase addition, density between nuclei, and the relative destabilization of the out-of-phase combination.',
    modelAnswer: 'In the bonding combination, same-phase amplitudes add between the nuclei, so the occupied electron density helps hold both nuclei together. In the antibonding combination, opposite phases cancel between the nuclei, creating a node and a higher-energy orbital.',
    rubric: ['Mentions in-phase addition', 'Mentions density buildup between nuclei', 'Compares with antibonding node or energy increase'],
  },
];

const overlapItems: AssessmentItem[] = [
  {
    id: 'overlap-distance-choice',
    type: 'choice',
    prompt: 'At fixed phase, what happens to the orbital interaction when the orbitals are pulled farther apart?',
    target: 'Predict the direction of the overlap effect before moving the distance slider.',
    choices: [
      { id: 'A', text: 'Useful overlap decreases and the energy split becomes smaller' },
      { id: 'B', text: 'Useful overlap increases and the energy split becomes larger' },
      { id: 'C', text: 'Overlap changes sign but not size' },
      { id: 'D', text: 'The bonding orbital becomes antibonding automatically' },
    ],
    correctChoiceId: 'A',
    feedback: 'Rule 11 in the QMOT list is the key: larger overlap gives a larger interaction. More separation means less overlap.',
    modelAnswer: 'As distance increases, the orbitals occupy less common space, so the useful overlap and the bonding/antibonding splitting decrease.',
    rubric: ['Predicts decreased overlap', 'Connects overlap to interaction strength', 'Avoids treating distance as a phase flip'],
  },
  {
    id: 'overlap-orientation-short',
    type: 'short',
    prompt: 'Describe one structural change in a real molecule that could improve useful orbital overlap.',
    target: 'Transfer the overlap slider to a chemical geometry claim.',
    feedback: 'Good answers use geometry: shorter distance, better orbital alignment, or hybrid directionality.',
    modelAnswer: 'A shorter bond length or a conformation that aligns two p orbitals parallel to each other improves overlap. Hybrid orbitals can also point electron density along the bond axis, improving sigma overlap.',
    rubric: ['Names a structural change', 'Connects it to spatial overlap', 'Avoids saying larger atoms always give stronger bonds'],
  },
];

const energyGapItems: AssessmentItem[] = [
  {
    id: 'gap-choice',
    type: 'choice',
    prompt: 'Two orbitals have good overlap. Which starting-energy situation gives the strongest mixing?',
    target: 'Apply the energy-gap rule.',
    choices: [
      { id: 'A', text: 'They begin close in energy' },
      { id: 'B', text: 'They begin very far apart in energy' },
      { id: 'C', text: 'The lower orbital is already full' },
      { id: 'D', text: 'The higher orbital has more nodes' },
    ],
    correctChoiceId: 'A',
    feedback: 'The energy-gap rule says smaller initial gaps produce stronger mixing interactions, assuming useful overlap is present.',
    modelAnswer: 'Small starting-energy gaps mix most strongly. Large gaps leave each resulting MO mostly like the starting orbital closest to it in energy.',
    rubric: ['Identifies small gap', 'Mentions overlap still matters', 'Connects gap to extent of mixing'],
  },
  {
    id: 'gap-polarization-short',
    type: 'short',
    prompt: 'When two unequal-energy orbitals mix, why is the lower resulting MO more like the lower-energy starting orbital?',
    target: 'Explain orbital character after unequal-energy mixing.',
    feedback: 'Use character language: lower keeps more lower-energy character; upper keeps more higher-energy character. The Going deeper panel gives the technical names.',
    modelAnswer: 'The lower MO keeps the larger contribution from the lower-energy starting orbital and mixes in some higher orbital in a bonding way. The upper MO keeps more of the higher-energy starting orbital and mixes in the lower one antibonding.',
    rubric: ['Recognizes unequal starting energies', 'Correctly assigns lower MO character', 'Correctly assigns upper MO character'],
  },
];

const polarizationItems: AssessmentItem[] = [
  {
    id: 'polarization-pi-choice',
    type: 'choice',
    prompt: 'In a C=O pi system, which statement best describes the pi and pi* polarizations?',
    target: 'Predict carbonyl orbital polarization from lower oxygen orbital energy.',
    choices: [
      { id: 'A', text: 'The pi MO is more oxygen-like; the pi* MO has a larger carbon coefficient' },
      { id: 'B', text: 'Both pi and pi* are more oxygen-like' },
      { id: 'C', text: 'Both pi and pi* are more carbon-like' },
      { id: 'D', text: 'C=O orbitals are unpolarized because C and O both use p orbitals' },
    ],
    correctChoiceId: 'A',
    feedback: 'Oxygen contributes lower-energy p orbitals. The lower MO leans toward oxygen; the higher antibonding MO has larger carbon character.',
    modelAnswer: 'The bonding pi orbital is lower and more oxygen-like, while the antibonding pi* orbital is higher and has the larger coefficient on carbon.',
    rubric: ['Places pi density toward oxygen', 'Places pi* coefficient toward carbon', 'Connects to electronegativity or orbital energy'],
  },
  {
    id: 'polarization-reactivity-short',
    type: 'short',
    prompt: 'Use the carbonyl pi* picture to explain why a nucleophile approaches the carbon atom rather than the oxygen atom.',
    target: 'Connect orbital coefficient to reactivity.',
    feedback: 'The key is the LUMO coefficient. Nucleophiles donate from filled orbitals into an empty acceptor orbital.',
    modelAnswer: 'A nucleophile donates into the carbonyl pi* LUMO. That LUMO is polarized with the larger coefficient on carbon, so overlap with the nucleophile is strongest at carbon.',
    rubric: ['Names pi* or LUMO', 'Mentions larger carbon coefficient', 'Connects filled nucleophile orbital to empty acceptor'],
  },
];

const ethyleneFormaldehydeItems: AssessmentItem[] = [
  {
    id: 'ef-compare-choice',
    type: 'choice',
    prompt: 'Why is ethylene a useful starting comparison for formaldehyde?',
    target: 'Recognize same electron/orbital framework and perturbation by oxygen.',
    choices: [
      { id: 'A', text: 'They have analogous valence-orbital patterns, but oxygen lowers and polarizes the C=O orbitals' },
      { id: 'B', text: 'They have identical orbital energies and identical reactivity' },
      { id: 'C', text: 'Ethylene contains two lone pairs like formaldehyde' },
      { id: 'D', text: 'Formaldehyde has no pi system' },
    ],
    correctChoiceId: 'A',
    feedback: 'The lesson is controlled comparison. The orbital framework is analogous, but oxygen changes starting energies and produces polarized MOs.',
    modelAnswer: 'Ethylene and formaldehyde have analogous pi frameworks. Replacing CH2 with oxygen lowers the oxygen p orbital energy, polarizing the bonding pi toward oxygen and pi* toward carbon.',
    rubric: ['Mentions analogous pi framework', 'Identifies oxygen as perturbation', 'States at least one polarization consequence'],
  },
  {
    id: 'ef-lone-pair-short',
    type: 'short',
    prompt: 'Formaldehyde has two oxygen lone-pair-type MOs. Why are they not the same as two identical textbook sp2 lone pairs in the full MO view?',
    target: 'Distinguish localized hybrid cartoons from full MO descriptions.',
    feedback: 'The answer should say that the full MOs have different symmetry and different mixing; localized lone-pair cartoons can be obtained by recombining them.',
    modelAnswer: 'In the MO picture, the two lone-pair-type orbitals have different symmetry and energy: one is more pi-type and one more sigma-type. They can be recombined into localized hybrid lone-pair pictures, but the full MO description does not require two identical lone pairs.',
    rubric: ['Mentions different symmetry or energy', 'Mentions full MO view', 'Allows localized hybrids as an alternative representation'],
  },
];

const twistGeometryItems: AssessmentItem[] = [
  {
    id: 'twist-overlap-choice',
    type: 'choice',
    prompt: 'A C=C pi system is twisted from 0° toward 90°. What happens to useful side-by-side p-orbital overlap?',
    target: 'Connect geometry change to p-orbital overlap.',
    choices: [
      { id: 'A', text: 'It decreases and approaches zero near 90°' },
      { id: 'B', text: 'It increases because the atoms are still bonded' },
      { id: 'C', text: 'It changes phase but not magnitude' },
      { id: 'D', text: 'It becomes a sigma bond' },
    ],
    correctChoiceId: 'A',
    feedback: 'The same atoms and electrons are present, but the p orbitals no longer point in compatible directions. The pi/pi* separation therefore shrinks.',
    modelAnswer: 'As the twist approaches 90°, the p orbitals become nearly perpendicular, so side-by-side pi overlap approaches zero and the pi/pi* separation becomes very small.',
    rubric: ['States overlap decreases', 'Identifies perpendicular p orbitals near 90°', 'Connects overlap to pi/pi* separation'],
  },
  {
    id: 'twist-conjugation-short',
    type: 'short',
    prompt: 'Use the twist model to explain why conjugated pi systems often prefer near-planar arrangements.',
    target: 'Transfer the twist slider to conjugation and planarity.',
    feedback: 'The answer should connect planarity to aligned p orbitals and electron sharing across the pi system.',
    modelAnswer: 'Near-planar geometry keeps neighboring p orbitals aligned, which allows useful overlap and delocalization. Twisting breaks that communication, so the stabilizing pi interaction is reduced.',
    rubric: ['Mentions aligned p orbitals', 'Connects alignment to delocalization', 'Explains why twisting is destabilizing'],
  },
];

const walshGeometryItems: AssessmentItem[] = [
  {
    id: 'walsh-choice',
    type: 'choice',
    prompt: 'In the CH3 Walsh diagram, which orbital is most strongly stabilized by pyramidalization?',
    target: 'Read the qualitative Walsh diagram.',
    choices: [
      { id: 'A', text: 'The formerly nonbonding p-type orbital that becomes sigma(out)-like after mixing' },
      { id: 'B', text: 'Only the lowest sigma(CH3) orbital' },
      { id: 'C', text: 'The antibonding virtual orbital only' },
      { id: 'D', text: 'No orbital changes on pyramidalization' },
    ],
    correctChoiceId: 'A',
    feedback: 'Pyramidalization moves H atoms off the node of the p orbital, giving it bonding character; secondary mixing then makes a sigma(out)-like hybrid.',
    modelAnswer: 'Orbital D, the p-type orbital in planar CH3, is strongly lowered when pyramidalization gives it bonding interaction with the hydrogens and allows mixing with the higher sigma orbital.',
    rubric: ['Identifies the p/nonbonding orbital', 'Connects distortion to new overlap', 'Mentions sigma(out) or hybrid character'],
  },
  {
    id: 'walsh-electron-count-short',
    type: 'short',
    prompt: 'Use electron count to explain why BH3 is planar while NH3 is pyramidal in the same MH3 Walsh framework.',
    target: 'Connect occupancy to geometry preference.',
    feedback: 'The orbital diagram is similar; the occupancy changes the geometry preference.',
    modelAnswer: 'BH3 has six valence electrons, so it fills the three lower M-H bonding orbitals and leaves the p/sigma(out) orbital empty; pyramidalization mostly destabilizes occupied B/C orbitals. NH3 has eight valence electrons, so the orbital strongly stabilized by pyramidalization is occupied, making the pyramidal geometry favorable.',
    rubric: ['Uses six vs eight valence electrons', 'Explains empty orbital in BH3', 'Explains occupied stabilized orbital in NH3'],
  },
];

const piChainItems: AssessmentItem[] = [
  {
    id: 'pi-node-choice',
    type: 'choice',
    prompt: 'For a related set of linear pi-chain MOs, what generally happens as the number of internal nodes increases?',
    target: 'Relate node count to relative pi MO energy.',
    choices: [
      { id: 'A', text: 'The orbital is higher in energy' },
      { id: 'B', text: 'The orbital is lower in energy' },
      { id: 'C', text: 'The orbital becomes a sigma orbital' },
      { id: 'D', text: 'The orbital loses all phase information' },
    ],
    correctChoiceId: 'A',
    feedback: 'Within the same pi system, more nodes means a higher-energy pi MO.',
    modelAnswer: 'The lowest pi MO has no internal node, and higher pi MOs have progressively more nodes. Node count is a visual handle for ranking energy.',
    rubric: ['Correct energy trend', 'Mentions nodes', 'Keeps comparison within a related pi system'],
  },
  {
    id: 'pi-allyl-short',
    type: 'short',
    prompt: 'Explain why the middle allyl MO has no coefficient on the central atom in the simple qualitative picture.',
    target: 'Use phase and symmetry to explain the nonbonding allyl MO.',
    feedback: 'The central atom lies on the node of that MO; the terminal p orbitals are out of phase with each other.',
    modelAnswer: 'The middle allyl MO is formed from opposite-phase terminal p orbitals. The central p orbital cannot mix with that combination by symmetry, so the central atom lies on a node and has zero coefficient in the simple picture.',
    rubric: ['Mentions terminal opposite phase', 'Mentions central node or zero coefficient', 'Uses symmetry or cancellation language'],
  },
];

const calculationItems: AssessmentItem[] = [
  {
    id: 'calc-qmot-choice',
    type: 'choice',
    prompt: 'What is the point of comparing a qualitative orbital cartoon with a calculated MO?',
    target: 'Understand the role of calculation as a check on qualitative reasoning.',
    choices: [
      { id: 'A', text: 'To see whether the qualitative model captures the nodal pattern, phase pattern, and major coefficients' },
      { id: 'B', text: 'To prove the cartoon is numerically exact' },
      { id: 'C', text: 'To replace all chemical reasoning with a picture' },
      { id: 'D', text: 'To ignore orbital symmetry' },
    ],
    correctChoiceId: 'A',
    feedback: 'The calculated MO is not the cartoon. The comparison tests whether the cartoon captures the chemically important structure.',
    modelAnswer: 'A good qualitative model should reproduce the computed MO in the features that matter for chemical reasoning: nodes, phase relationships, approximate localization, and relative coefficients.',
    rubric: ['Mentions calculated MO as a check', 'Mentions nodes/phase/coefficients', 'Avoids claiming numerical exactness'],
  },
  {
    id: 'calc-transfer-short',
    type: 'short',
    prompt: 'Choose one group orbital from the lessons and explain how it helps you reason about a larger molecule.',
    target: 'Transfer group-orbital logic beyond the screen.',
    feedback: 'Good answers name the group orbital and state what chemical question it helps answer.',
    modelAnswer: 'The carbonyl pi* group orbital helps predict nucleophilic addition to larger aldehydes and ketones: the LUMO is still polarized toward carbon, so nucleophiles approach carbon even when the rest of the molecule is larger.',
    rubric: ['Names a group orbital', 'Applies it to a larger molecule', 'Connects orbital feature to structure or reactivity'],
  },
];

export const guidedLessonContent: Record<GuidedRestLessonId, GuidedLessonData> = {
  bonding: {
    id: 'bonding',
    purpose: 'Turn the addition/subtraction rules from Lesson 2 into the familiar bonding and antibonding pictures.',
    question: 'How does phase decide whether overlap makes a bond or a node?',
    visual: 'bonding',
    checkpointLead: 'Use the buttons before answering. The assessment asks whether you can explain the node, not just identify it.',
    endLead: 'This submitted assessment uses the same signs-and-density idea in a new sentence. No answer key is exported.',
    stages: [
      {
        id: 'in-phase',
        shortTitle: 'In phase',
        title: 'Same signs reinforce between the nuclei',
        lead: 'When the facing lobes carry the same sign, the wave amplitudes add in the internuclear region. If electrons occupy that MO, density is placed where it helps bind the atoms.',
        equation: '+ + + -> larger ψ between nuclei',
        correction: 'The + sign is not positive charge. It is a phase label for wave amplitude.',
        goingDeeper: [phaseTermPanel],
      },
      {
        id: 'out-of-phase',
        shortTitle: 'Out of phase',
        title: 'Opposite signs cancel and create a node',
        lead: 'When the facing lobes have opposite signs, the wave amplitudes cancel between the atoms. The node is the visible reason the orbital is antibonding.',
        equation: '+ + − -> cancellation -> node',
        correction: 'Antibonding does not mean there was no interaction. It means the interaction produced a higher-energy combination.',
        goingDeeper: [
          phaseTermPanel,
          {
            title: 'Why antibonding rises more than bonding falls',
            body: 'For a two-orbital interaction, the higher-energy antibonding combination is destabilized more than the lower-energy bonding combination is stabilized. That asymmetry becomes important when both starting orbitals are already filled.',
            terms: [
              { term: 'antibonding', meaning: 'An orbital combination with a node or destructive interaction between the atoms being considered.' },
              { term: 'closed-shell repulsion', meaning: 'The net destabilization that occurs when two filled orbitals are forced to mix.' },
            ],
          },
        ],
      },
      {
        id: 'energy',
        shortTitle: 'Energy split',
        title: 'Bonding and antibonding are an energy pair',
        lead: 'The larger the useful interaction, the more the pair of resulting orbitals separates in energy. The lower member is bonding; the upper member is antibonding.',
        equation: 'two AOs -> lower MO + upper MO',
        correction: 'Do not call the lower orbital bonding just because it is drawn lower. It is lower because its phase pattern increases useful density.',
      },
    ],
    checkpoints: bondingItems,
    endItems: bondingItems,
  },
  overlap: {
    id: 'overlap',
    purpose: 'Make overlap a controllable variable rather than a word students recite.',
    question: 'What changes when the same orbitals are closer, farther apart, larger, smaller, or mis-phased?',
    visual: 'overlap',
    checkpointLead: 'Predict what happens before moving each slider, then check your prediction against the readout.',
    endLead: 'Use one slider result to explain one real structural consequence. No answer key is exported.',
    stages: [
      {
        id: 'space',
        shortTitle: 'Same space',
        title: 'Overlap means occupying the same region of space',
        lead: 'Orbitals interact only to the extent that their amplitudes occupy common space. Pull them apart and the interaction weakens.',
        equation: 'more shared space -> larger interaction',
        correction: 'Overlap is not the same as atoms being close in a Lewis structure. The orbital shapes and directions matter.',
      },
      {
        id: 'phase',
        shortTitle: 'Useful overlap',
        title: 'Phase decides whether shared space is useful',
        lead: 'Matched phase makes shared space bonding. Opposite phase makes the same shared space cancel.',
        equation: 'overlap × phase relationship -> useful overlap',
        correction: 'Large overlap is not automatically stabilizing. Filled-filled overlap can be destabilizing.',
        goingDeeper: [phaseTermPanel],
      },
      {
        id: 'structure',
        shortTitle: 'Structure',
        title: 'Geometry can increase or destroy overlap',
        lead: 'Bond length, orbital direction, and conformation all change useful overlap. This is why orbital drawings have structural consequences.',
        equation: 'geometry -> overlap -> orbital splitting',
        correction: 'Do not treat overlap as a fixed property of two atoms. It changes with molecular geometry.',
        goingDeeper: [
          {
            title: 'Sigma overlap and pi overlap are directional in different ways',
            body: 'Sigma overlap is strongest along the bond axis. Pi overlap is side-by-side and is sensitive to whether neighboring p orbitals remain parallel. This is why twisting matters later in the geometry lesson.',
            terms: [
              { term: 'sigma overlap', meaning: 'Head-on overlap along a bond axis.' },
              { term: 'pi overlap', meaning: 'Side-by-side overlap, usually from parallel p orbitals.' },
            ],
          },
        ],
      },
    ],
    checkpoints: overlapItems,
    endItems: overlapItems,
  },
  'energy-gap': {
    id: 'energy-gap',
    purpose: 'Separate two ideas that students often collapse: overlap and starting energy match.',
    question: 'Why do some orbitals mix strongly while others barely affect one another?',
    visual: 'energy-gap',
    checkpointLead: 'Keep overlap fixed, change the energy gap, and watch the character percentages.',
    endLead: 'Explain the energy-gap rule in words before applying it to carbonyl polarization. No answer key is exported.',
    stages: [
      {
        id: 'close',
        shortTitle: 'Small gap',
        title: 'Close starting energies mix strongly',
        lead: 'If two orbitals already begin close in energy and have useful overlap, the resulting MOs separate strongly and both contain substantial character from both starting orbitals.',
        equation: 'small ΔE + overlap -> strong mixing',
        correction: 'Good overlap alone is not enough. The starting energies still matter.',
        goingDeeper: [
          {
            title: 'Degenerate and nondegenerate are energy words',
            body: 'Degenerate means equal in energy. Nondegenerate means unequal in energy. The lesson uses “equal-energy” and “unequal-energy” in the main text so the chemistry remains readable, but these are the technical words you will see in textbooks.',
            terms: [
              { term: 'degenerate', meaning: 'Equal in energy.' },
              { term: 'nondegenerate', meaning: 'Not equal in energy.' },
            ],
          },
        ],
      },
      {
        id: 'far',
        shortTitle: 'Large gap',
        title: 'Large starting gaps leave orbitals mostly unmixed',
        lead: 'When the starting gap is large, the lower resulting MO remains mostly like the lower starting orbital and the upper resulting MO remains mostly like the higher starting orbital.',
        equation: 'large ΔE -> weak mixing',
        correction: 'A small contribution can still matter chemically if it appears in a frontier orbital.',
      },
      {
        id: 'character',
        shortTitle: 'Character',
        title: 'Unequal-energy mixing polarizes the resulting MOs',
        lead: 'The lower MO keeps more low-energy character. The upper MO keeps more high-energy character. That rule will explain why carbonyl pi and pi* orbitals are polarized differently.',
        equation: 'lower MO ≈ lower AO; upper MO ≈ upper AO',
        correction: 'Do not confuse orbital character with charge. A coefficient is a contribution to a wavefunction.',
        goingDeeper: [
          {
            title: 'Second-order mixing',
            body: 'Textbooks often call unequal-energy orbital mixing a second-order interaction. In this app, the phrase means the same thing as “two orbitals mix, but one starts lower than the other.”',
            terms: [
              { term: 'second-order mixing', meaning: 'Mixing between unequal-energy orbitals.' },
              { term: 'coefficient', meaning: 'The numerical weight of one starting orbital inside a resulting MO.' },
            ],
          },
        ],
      },
    ],
    checkpoints: energyGapItems,
    endItems: energyGapItems,
  },
  polarization: {
    id: 'polarization',
    purpose: 'Show how electronegativity enters MO pictures through orbital energy and coefficient changes.',
    question: 'Why does a carbonyl have oxygen-rich pi bonding but carbon-rich pi* accepting character?',
    visual: 'polarization',
    checkpointLead: 'Toggle C=C, C=N, and C=O, then explain which lobe becomes chemically important.',
    endLead: 'Use the carbonyl pi* LUMO to make one reactivity prediction. No answer key is exported.',
    stages: [
      {
        id: 'lower-heteroatom',
        shortTitle: 'Lower X',
        title: 'Electronegative atoms contribute lower-energy orbitals',
        lead: 'Oxygen p orbitals begin lower in energy than carbon p orbitals. That starting-energy difference changes the character of both the bonding and antibonding pi MOs.',
        equation: 'O 2p lower than C 2p',
        correction: 'This is not a formal charge argument. It is an orbital-energy argument.',
        goingDeeper: [
          {
            title: 'Perturbation is just a controlled change',
            body: 'Here, ethylene is the clean reference case. Replacing one carbon fragment with oxygen changes the starting orbital energy. Textbooks call that a perturbation. The word sounds bigger than the idea.',
            terms: [
              { term: 'perturbation', meaning: 'A change made to a reference model so you can see what responds.' },
              { term: 'electronegativity', meaning: 'A chemical tendency to attract electron density; in this MO context it is reflected by lower valence orbital energy.' },
            ],
          },
        ],
      },
      {
        id: 'bonding-polarized',
        shortTitle: 'pi toward O',
        title: 'The lower pi MO becomes more oxygen-like',
        lead: 'In the lower MO, the lower-energy starting orbital contributes more strongly. That shifts the bonding pi orbital toward oxygen.',
        equation: 'lower MO = more lower-AO character',
        correction: 'A smaller drawn oxygen orbital can still have a larger coefficient; size and coefficient are not identical.',
        goingDeeper: [
          {
            title: 'Coefficient is not the same as drawn size',
            body: 'A lobe drawn on a smaller atom may look smaller because the atom itself is compact. A coefficient is the mathematical contribution of that starting orbital to the MO. The picture and the coefficient usually point in the same direction, but they are not identical concepts.',
            terms: [{ term: 'coefficient', meaning: 'The weight of an AO or group orbital in the MO.' }],
          },
        ],
      },
      {
        id: 'antibonding-carbon',
        shortTitle: 'pi* toward C',
        title: 'The antibonding pi* MO has larger carbon character',
        lead: 'The upper MO keeps more of the higher-energy carbon orbital. That is why the carbonyl LUMO is attacked at carbon.',
        equation: 'upper MO = more higher-AO character',
        correction: 'The electrophilic atom is not chosen by formal charge alone; the LUMO coefficient matters.',
      },
    ],
    checkpoints: polarizationItems,
    endItems: polarizationItems,
  },
  'ethylene-formaldehyde': {
    id: 'ethylene-formaldehyde',
    purpose: 'Compare a hydrocarbon pi bond with a heteronuclear carbonyl pi system using the same orbital-mixing logic.',
    question: 'What stays the same, and what changes, when ethylene is perturbed into formaldehyde?',
    visual: 'ethylene-formaldehyde',
    checkpointLead: 'Toggle between molecules and name what stayed the same before naming what changed.',
    endLead: 'Use ethylene as the baseline and oxygen as the perturbation. No answer key is exported.',
    stages: [
      {
        id: 'ethylene-baseline',
        shortTitle: 'C=C baseline',
        title: 'Ethylene gives the clean equal-energy pi/pi* pattern',
        lead: 'Two equivalent carbon p orbitals mix evenly. The bonding pi MO is occupied, and the antibonding pi* MO is the LUMO.',
        equation: 'C p + C p -> pi and pi*',
        correction: 'The pi bond is not a second sigma bond. It has side-by-side p overlap.',
      },
      {
        id: 'formaldehyde-perturbation',
        shortTitle: 'C=O perturbation',
        title: 'Formaldehyde keeps the pattern but polarizes it',
        lead: 'The carbonyl pi system still has bonding and antibonding combinations. Oxygen lowers one starting orbital, so the coefficients become unequal.',
        equation: 'C p + O p -> polarized pi and pi*',
        correction: 'Do not describe C=O as simply ionic. It is still a covalent pi system, but polarized.',
        goingDeeper: [
          {
            title: 'Isoelectronic comparison',
            body: 'Isoelectronic means “same number of electrons.” Ethylene and formaldehyde are useful to compare because they have analogous valence frameworks, even though oxygen changes the orbital energies.',
            terms: [{ term: 'isoelectronic', meaning: 'Having the same number of electrons in the comparison being made.' }],
          },
        ],
      },
      {
        id: 'lone-pairs',
        shortTitle: 'Lone pairs',
        title: 'The MO picture also contains lone-pair-type orbitals',
        lead: 'The full MO view does not require two identical localized lone pairs. Lone-pair-type orbitals can differ in symmetry and energy.',
        equation: 'full MOs can be recombined into localized pictures',
        correction: 'A localized lone-pair cartoon is useful, but it is not the only valid orbital description.',
        goingDeeper: [
          {
            title: 'Canonical versus localized MOs',
            body: 'Canonical MOs are the direct orbitals that come out of the usual calculation or qualitative diagram. Localized orbitals are recombinations that look more like textbook bonds and lone pairs. Both can be useful if you remember what each representation is doing.',
            terms: [
              { term: 'canonical MO', meaning: 'A delocalized MO from the standard orbital solution or diagram.' },
              { term: 'localized orbital', meaning: 'A recombined orbital picture that resembles a bond or lone pair.' },
            ],
          },
        ],
      },
    ],
    checkpoints: ethyleneFormaldehydeItems,
    endItems: ethyleneFormaldehydeItems,
  },
  geometry: {
    id: 'geometry',
    purpose: 'Keep the existing Lesson 8 scope: geometry changes overlap, especially when p orbitals twist out of alignment.',
    question: 'Why does twisting a pi system reduce the interaction even though the same atoms and electrons are still present?',
    visual: 'twist-geometry',
    checkpointLead: 'Move the twist slider first. Predict what happens at 90° before checking the readout.',
    endLead: 'Use twist angle to explain planarity in a conjugated pi system. No answer key is exported.',
    stages: [
      {
        id: 'aligned',
        shortTitle: 'Aligned p',
        title: 'Aligned neighboring p orbitals communicate strongly',
        lead: 'When neighboring p orbitals point in compatible directions, side-by-side pi overlap is strong and the pi/pi* energy separation is large.',
        equation: 'parallel p orbitals -> useful pi overlap',
        correction: 'A pi interaction is not guaranteed by drawing a double bond. The orbitals need the right alignment.',
        goingDeeper: [phaseTermPanel],
      },
      {
        id: 'twisted',
        shortTitle: 'Twisted p',
        title: 'Twisting removes useful overlap',
        lead: 'As one p orbital twists out of alignment, the common side-by-side amplitude shrinks. Near 90°, the p orbitals barely communicate.',
        equation: 'overlap ≈ cos(twist angle)',
        correction: 'The atoms did not disappear and the electrons did not disappear. The geometry changed the orbital interaction.',
        goingDeeper: [
          {
            title: 'Torsion angle',
            body: 'A torsion angle reports how much one part of a molecule is rotated relative to another. In this lesson, the twist slider is a simplified torsion-angle model for pi overlap.',
            terms: [{ term: 'torsion angle', meaning: 'A rotation angle describing how two parts of a molecule are twisted relative to one another.' }],
          },
        ],
      },
      {
        id: 'conjugation',
        shortTitle: 'Conjugation',
        title: 'Planarity lets a pi system delocalize',
        lead: 'Conjugated systems often prefer near-planar arrangements because aligned p orbitals can share electron density across more atoms.',
        equation: 'alignment -> delocalization -> stabilization',
        correction: 'Planarity is not magic. It is a geometry that preserves overlap.',
        goingDeeper: [
          {
            title: 'Conjugation',
            body: 'Conjugation means adjacent p orbitals can interact across multiple atoms. The word is often introduced through resonance structures, but the orbital reason is alignment and overlap.',
            terms: [{ term: 'conjugation', meaning: 'Interaction among adjacent p orbitals across a chain or ring.' }],
          },
        ],
      },
    ],
    checkpoints: twistGeometryItems,
    endItems: twistGeometryItems,
  },
  'walsh-geometry': {
    id: 'walsh-geometry',
    purpose: 'Add a new lesson after the existing geometry lesson: Walsh-style geometry reasoning from orbital occupancy.',
    question: 'Why can the same orbital framework predict different shapes for BH3, CH3+, NH3, CH3−, radicals, and carbenes?',
    visual: 'walsh-geometry',
    checkpointLead: 'Choose an electron count, then predict whether the stabilized orbital is occupied.',
    endLead: 'The geometry argument is an occupancy argument. No answer key is exported.',
    stages: [
      {
        id: 'walsh',
        shortTitle: 'Walsh idea',
        title: 'A Walsh diagram follows orbital energies during distortion',
        lead: 'Start with the high-symmetry structure, distort it, and track which orbitals rise or fall. Then put electrons into the diagram.',
        equation: 'geometry -> overlap changes -> orbital energies change',
        correction: 'Do not pick the geometry first and explain it afterward. Let occupancy decide the preference.',
        goingDeeper: [
          {
            title: 'Walsh diagram',
            body: 'A Walsh diagram tracks how orbital energies change as molecular geometry changes. The diagram does not replace chemical reasoning; it organizes it.',
            terms: [
              { term: 'Walsh diagram', meaning: 'A plot or diagram showing orbital energies as a function of molecular geometry.' },
              { term: 'high symmetry', meaning: 'A reference structure with more symmetry operations, used as a clean starting point.' },
            ],
          },
        ],
      },
      {
        id: 'mh3',
        shortTitle: 'MH3 count',
        title: 'The MH3 framework changes when the key orbital is occupied',
        lead: 'BH3 has six valence electrons and remains planar. NH3 has eight and uses the stabilized orbital in the pyramidal form.',
        equation: 'occupied stabilized orbital favors distortion',
        correction: 'The orbital diagram is qualitatively similar; the electron count changes the shape preference.',
        goingDeeper: [
          {
            title: 'Virtual orbital and occupancy',
            body: 'A virtual orbital is an unoccupied orbital in the ground-state electron count. If an orbital is empty, lowering it does not directly stabilize the molecule until electrons are placed in it.',
            terms: [
              { term: 'virtual orbital', meaning: 'An orbital present in the diagram but unoccupied in the electron configuration being considered.' },
              { term: 'occupancy', meaning: 'How many electrons are placed in an orbital.' },
            ],
          },
        ],
      },
      {
        id: 'intermediates',
        shortTitle: 'Intermediates',
        title: 'Reactive intermediates are electron-count tests of the same picture',
        lead: 'Carbocations, radicals, carbanions, and carbenes differ because the crucial orbital is empty, singly occupied, or doubly occupied.',
        equation: 'empty / singly occupied / doubly occupied -> different geometry preferences',
        correction: 'Do not memorize planar or pyramidal as labels. Ask which orbital is occupied.',
        goingDeeper: [
          {
            title: 'Frontier orbital language',
            body: 'The frontier orbitals are the highest occupied and lowest unoccupied orbitals used for chemical reasoning. They are not the only orbitals in the molecule, but they often dominate structure and reactivity arguments.',
            terms: [
              { term: 'HOMO', meaning: 'Highest occupied molecular orbital.' },
              { term: 'LUMO', meaning: 'Lowest unoccupied molecular orbital.' },
              { term: 'SOMO', meaning: 'Singly occupied molecular orbital.' },
            ],
          },
        ],
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
        modelAnswer: 'In CH2, bending opens a gap between the relevant frontier orbitals. A singlet can pair both electrons in the lower orbital at a smaller angle, while a triplet keeps one electron in each orbital and favors a wider angle.',
        rubric: ['Mentions singlet/triplet occupancy', 'Mentions bending or angle change', 'Connects occupancy to energy preference'],
      },
    ],
  },
  'pi-chain': {
    id: 'pi-chain',
    purpose: 'Build longer pi systems from the same add/subtract logic used in Lessons 1 and 2.',
    question: 'How do node count and phase pattern organize the pi orbitals of allyl, butadiene, benzene, and longer chains?',
    visual: 'pi-chain',
    checkpointLead: 'Change the number of p orbitals and predict the node count before selecting the MO.',
    endLead: 'Use node count, phase pattern, and coefficients to explain the result. No answer key is exported.',
    stages: [
      {
        id: 'count',
        shortTitle: 'N orbitals',
        title: 'N p orbitals make N pi MOs',
        lead: 'Conservation of orbitals is simple: a chain of N p orbitals produces N pi molecular orbitals.',
        equation: 'N AOs -> N MOs',
        correction: 'Do not create or destroy orbitals. Mixing reorganizes the starting set.',
      },
      {
        id: 'nodes',
        shortTitle: 'Nodes rank',
        title: 'More nodes generally means higher energy',
        lead: 'The lowest pi MO has the fewest nodes. Higher pi MOs introduce more sign changes and more internal nodes.',
        equation: 'node count increases with energy',
        correction: 'Node count ranks orbitals within a related set. It is not a universal energy scale across unrelated molecules.',
      },
      {
        id: 'allyl-benzyl',
        shortTitle: 'Zero coefficients',
        title: 'Some atoms can sit on nodes',
        lead: 'In allyl and benzyl systems, the frontier orbital can have zero or small coefficients at specific atoms. That explains where charge or radical character appears in resonance pictures.',
        equation: 'coefficient near zero -> little frontier-orbital character at that atom',
        correction: 'A resonance structure is a bookkeeping picture; the orbital coefficient gives the visual MO reason.',
        goingDeeper: [
          {
            title: 'Group orbital and resonance language',
            body: 'A group orbital is a reusable orbital pattern associated with a functional group or molecular fragment. Resonance structures are useful bookkeeping pictures, but the MO shows the phase and coefficient pattern directly.',
            terms: [
              { term: 'group orbital', meaning: 'A transferable orbital pattern associated with a molecular fragment or functional group.' },
              { term: 'resonance', meaning: 'A set of Lewis-style bookkeeping structures used to describe delocalization.' },
            ],
          },
        ],
      },
    ],
    checkpoints: piChainItems,
    endItems: piChainItems,
  },
  calculation: {
    id: 'calculation',
    purpose: 'Use computed MOs as a reality check on the qualitative model without turning the lesson into a computational chemistry course.',
    question: 'What should a student look for when a calculated orbital is compared with a qualitative MO cartoon?',
    visual: 'calculation',
    checkpointLead: 'Pick a feature in the qualitative cartoon, then check whether the calculated-style picture preserves it.',
    endLead: 'Focus on transfer: can the same group-orbital idea explain a new molecule? No answer key is exported.',
    stages: [
      {
        id: 'features',
        shortTitle: 'Features',
        title: 'Compare features, not decorative surfaces',
        lead: 'The meaningful comparison is nodal pattern, phase pattern, coefficient size, and localization. The exact contour surface depends on calculation and display settings.',
        equation: 'qualitative model -> nodes, phase, coefficients, symmetry',
        correction: 'Do not grade the cartoon by whether it looks exactly like a rendered isosurface.',
        goingDeeper: [
          {
            title: 'Isosurface',
            body: 'A calculated orbital is often drawn as an isosurface: a surface where the orbital amplitude has a selected value. Changing the contour value changes the appearance without changing the underlying orbital.',
            terms: [{ term: 'isosurface', meaning: 'A surface drawn at a chosen constant value of a function.' }],
          },
        ],
      },
      {
        id: 'group-orbitals',
        shortTitle: 'Transfer',
        title: 'Group orbitals make larger molecules manageable',
        lead: 'Functional groups contribute recognizable orbitals. A carbonyl pi* or alkene pi orbital remains useful inside a larger molecule.',
        equation: 'functional group -> transferable orbital pattern',
        correction: 'A group orbital is a model, not an isolated molecule floating inside the larger molecule.',
        goingDeeper: [
          {
            title: 'Transferable does not mean identical',
            body: 'A group orbital in a larger molecule is modified by its surroundings. The point is not that it is unchanged; the point is that the recognizable pattern remains useful enough to guide reasoning.',
            terms: [{ term: 'transferable orbital', meaning: 'A recurring orbital pattern that remains recognizable across related molecules.' }],
          },
        ],
      },
      {
        id: 'limits',
        shortTitle: 'Limits',
        title: 'Know what the model does not claim',
        lead: 'The app uses scaled teaching energies. It is designed for qualitative reasoning, not numerical prediction of orbital energies or reaction barriers.',
        equation: 'teaching units != experimental energies',
        correction: 'A good qualitative model is useful because it predicts trends and explanations, not because it gives exact numbers.',
        goingDeeper: [
          {
            title: 'Teaching units',
            body: 'The sliders deliberately use arbitrary teaching units. That keeps the lesson focused on direction and mechanism: what increases, what decreases, and why.',
            terms: [{ term: 'qualitative model', meaning: 'A model built to predict directions, relationships, and explanations rather than exact numerical values.' }],
          },
        ],
      },
    ],
    checkpoints: calculationItems,
    endItems: calculationItems,
  },
};
