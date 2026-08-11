import type {
  Campaign,
  KnowledgeEdge,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeNodeKind,
} from './types'
import { getCampaignById } from './campaigns'

/* ------------------------------------------------------------------ */
/* Deterministic RNG                                                   */
/* ------------------------------------------------------------------ */

/** Small seeded PRNG (mulberry32) — keeps generated edges/layout stable
 *  across renders so the graph doesn't reshuffle on every navigation. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/* ------------------------------------------------------------------ */
/* EGFR Lead Triage — the showcase graph                               */
/* ------------------------------------------------------------------ */

const egfrSources: Array<[title: string, updatedAgo: string, doi: string, abstract: string]> = [
  [
    'The Panitumumab–EGFR Complex Reveals a Binding Mechanism That Overcomes Cetuximab-Induced Resistance',
    'Jun 17',
    '10.1371/journal.pone.0163366',
    'Reports the crystal structure of the panitumumab Fab in complex with EGFR domain III, confirming that panitumumab, like cetuximab, binds a domain III ligand-competitive epitope with a largely overlapping footprint. Panitumumab presents a large negatively charged central cavity in its CDRs (where cetuximab uses Y104 to fill the analogous space). This cavity accommodates the bulky positively charged arginine introduced by the S492R ectodomain substitution, explaining why panitumumab retains binding to the cetuximab-resistant mutant.',
  ],
  [
    'Structural Basis for Inhibition of the Epidermal Growth Factor Receptor by Cetuximab',
    'Jun 15',
    '10.1016/j.ccr.2005.03.003',
    'Crystal structure of the cetuximab Fab bound to the soluble EGFR extracellular region. Cetuximab binds exclusively to domain III, partially occluding the ligand-binding region and sterically blocking the receptor from adopting the extended active conformation required for dimerization.',
  ],
  [
    'Antibody-Induced Receptor Internalization Rates Predict Anti-EGFR Efficacy',
    'Jun 14',
    '10.1074/jbc.M116.741140',
    'Compares internalization kinetics across a panel of anti-EGFR antibodies and correlates rapid receptor down-modulation with in vivo tumor growth inhibition, arguing internalization rate is an under-weighted lead-selection axis.',
  ],
  [
    'Epitope Binning of Therapeutic Anti-EGFR Antibodies by High-Throughput SPR',
    'Jun 12',
    '10.4161/mabs.2.5.12945',
    'Uses classical sandwich SPR to bin a large antibody panel against reference mAbs (cetuximab, matuzumab, panitumumab, necitumumab), resolving four dominant competitive communities on the EGFR ectodomain.',
  ],
  [
    'Matuzumab Binds a Distinct Domain III Epitope and Blocks the Extended Conformation',
    'Jun 11',
    '10.1073/pnas.0709020105',
    'Shows matuzumab does not directly overlap the ligand-binding site but instead locks EGFR in the tethered, inactive conformation, defining a mechanistically orthogonal epitope community.',
  ],
  [
    'Necitumumab: A Second-Generation Anti-EGFR mAb — Structure and Function',
    'Jun 10',
    '10.1080/19420862.2016.1156285',
    'Characterizes necitumumab affinity, epitope, and ADCC competency; the antibody competes with ligand at domain III and shows slower off-rate than cetuximab.',
  ],
  [
    'Kinetic Analysis of EGF Binding to EGFR by Surface Plasmon Resonance',
    'Jun 9',
    '10.1021/bi00107a015',
    'Foundational SPR study establishing 1:1 Langmuir fitting for EGF/EGFR interactions and the KD ranges expected for high-affinity binders.',
  ],
  [
    'The S492R Ectodomain Mutation Confers Cetuximab Resistance in Colorectal Cancer',
    'Jun 8',
    '10.1038/nm.2609',
    'Identifies the acquired S492R substitution in EGFR domain III as a driver of cetuximab resistance, while panitumumab binding is preserved.',
  ],
  [
    'Developability Assessment of Antibody Candidates: A Framework',
    'Jun 7',
    '10.1080/19420862.2015.1016694',
    'Proposes a battery of early developability assays (thermal stability, self-association, poly-specificity) to de-risk leads before committing to cell-line development.',
  ],
  [
    'ADCC Potency Is Governed by Fc Glycosylation and Epitope Geometry',
    'Jun 6',
    '10.4049/jimmunol.1003526',
    'Links afucosylation and the spatial presentation of the bound epitope to effector-cell recruitment potency across an anti-EGFR panel.',
  ],
  [
    'Domain III Ligand-Competitive Epitopes Define the Dominant Anti-EGFR Community',
    'Jun 5',
    '10.1016/j.jmb.2012.04.026',
    'Structural meta-analysis mapping the majority of clinical anti-EGFR antibodies onto overlapping domain III footprints, with implications for combination pairing.',
  ],
  [
    'Biolayer Interferometry vs. SPR for Antibody Affinity Ranking',
    'Jun 4',
    '10.1016/j.ab.2013.05.024',
    'Cross-platform comparison showing BLI and SPR give concordant affinity rank-orders but diverge on absolute koff for very slow dissociators.',
  ],
  [
    'Conformational Selection in EGFR Extracellular Activation',
    'Jun 3',
    '10.1016/j.cell.2006.02.016',
    'Describes the tethered-to-extended conformational equilibrium of the EGFR ectodomain and how ligand and antibodies shift it.',
  ],
  [
    'A High-Throughput Yeast Display Campaign for Anti-EGFR Fragments',
    'Jun 2',
    '10.1093/protein/gzp003',
    'Yeast-display selection yielding domain III binders with sub-nanomolar affinity and reports epitope diversity across the output pool.',
  ],
  [
    'Poly-Specificity Reagent (PSR) Binding Predicts Clinical Half-Life',
    'Jun 1',
    '10.1073/pnas.1616408114',
    'Correlates PSR non-specific binding scores with in vivo clearance, supporting PSR as a developability gate.',
  ],
  [
    'Cross-Reactivity of Anti-EGFR Antibodies with EGFRvIII',
    'May 30',
    '10.1158/0008-5472.CAN-05-1867',
    'Assesses which domain III binders retain affinity to the EGFRvIII deletion variant relevant in glioblastoma.',
  ],
  [
    'Thermal Stability of IgG1 Fab Fragments and Aggregation Propensity',
    'May 29',
    '10.1002/pro.2647',
    'DSC and DLS characterization relating Fab melting temperature to shelf-stability and aggregation onset.',
  ],
  [
    'Epitope Diversity Improves Combination Efficacy Against EGFR-Driven Tumors',
    'May 28',
    '10.1126/scitranslmed.aaf2606',
    'Demonstrates non-overlapping antibody mixtures drive superior receptor down-modulation compared with any single clone.',
  ],
  [
    'Kinetic Exclusion Assay Measurement of Femtomolar Antibody Affinities',
    'May 27',
    '10.1016/j.jim.2008.05.010',
    'KinExA methodology extending affinity measurement below the SPR floor for very tight binders.',
  ],
  [
    'Fc Engineering Strategies to Enhance Effector Function',
    'May 26',
    '10.1038/nrd4363',
    'Review of glycoengineering and protein-engineering routes to tune ADCC/CDC without perturbing antigen binding.',
  ],
  [
    'The Role of koff in Antibody Residence Time and Efficacy',
    'May 25',
    '10.1124/mol.112.077693',
    'Argues residence time (1/koff) rather than equilibrium KD better predicts pharmacodynamic effect for some receptor targets.',
  ],
  [
    'Structural Determinants of Antibody Specificity at Domain III',
    'May 24',
    '10.1016/j.str.2013.08.020',
    'Alanine-scanning and structural work identifying the paratope hot-spots that distinguish ligand-competitive binders.',
  ],
  [
    'High-Concentration Viscosity as an Early Developability Flag',
    'May 23',
    '10.1208/s12248-012-9367-0',
    'Relates concentration-dependent viscosity to charge-patch surface features predictable from sequence.',
  ],
  [
    'Benchmarking 1:1 Langmuir vs. Heterogeneous-Ligand SPR Fits',
    'May 22',
    '10.1016/j.ab.2006.07.027',
    'Guidance on when a clean 1:1 fit is defensible and how Chi²/Rmax thresholds should gate kinetic acceptance.',
  ],
  [
    'Anti-EGFR Antibody Pairs for Sandwich Immunoassays',
    'May 21',
    '10.1373/clinchem.2011.163634',
    'Identifies orthogonal capture/detection pairs, useful proxies for epitope non-overlap.',
  ],
  [
    'Ligand-Blocking Potency Correlates with Domain III Occlusion Area',
    'May 20',
    '10.1074/jbc.M113.480467',
    'Quantifies buried surface area at the ligand site and its relationship to functional EGF-blocking IC50.',
  ],
  [
    'Cell-Surface Receptor Occupancy Assays for Anti-EGFR Leads',
    'May 19',
    '10.1177/1087057113497245',
    'Flow-cytometry occupancy methods that bridge biochemical affinity to cellular potency.',
  ],
  [
    'Immunogenicity Risk from Framework and CDR Sequence Liabilities',
    'May 18',
    '10.4161/mabs.28066',
    'In-silico and in-vitro assessment of T-cell epitope liabilities in candidate frameworks.',
  ],
  [
    'Matuzumab and Cetuximab Combination Locks EGFR Inactive',
    'May 17',
    '10.1158/1078-0432.CCR-08-1953',
    'Shows a ligand-competitive plus conformation-locking pair cooperatively suppresses signaling.',
  ],
  [
    'A Reference Panel for Anti-EGFR Epitope Binning Studies',
    'May 16',
    '10.4161/mabs.5.1.22990',
    'Curates a standardized set of reference antibodies and protocols for reproducible competitive binning.',
  ],
]

const egfrChunks: Array<[title: string, updatedAgo: string, origin: string, detail: string]> = [
  [
    'Approved anti-EGFR therapeutics overview',
    '3h ago',
    'approved-therapeutics.md',
    'Cetuximab and panitumumab both bind EGFR domain III and block ligand binding; necitumumab is a second-generation domain III binder; matuzumab is conformation-locking. All four are the standard reference set for epitope binning.',
  ],
  [
    'S492R resistance and antibody coverage',
    '3h ago',
    'approved-therapeutics.md',
    'The acquired S492R ectodomain mutation abolishes cetuximab binding but not panitumumab, which tolerates the bulky arginine via a negatively charged CDR cavity. Lead candidates should be counter-screened against S492R.',
  ],
  [
    'Kinetics acceptance criteria',
    '3h ago',
    'approved-therapeutics.md',
    'Candidates pass with KD ≤ 10 nM and a clean 1:1 Langmuir fit (Chi² under 10% of Rmax). koff is characterized but not a gate; clean single-site binders advance to epitope binning.',
  ],
  [
    'Epitope binning gate definition',
    '3h ago',
    'approved-therapeutics.md',
    'Candidates blocking >50% of a reference mAb response, or blocked by one, advance. Orthogonal binders are flagged for pairing rather than dropped.',
  ],
  [
    'Ligand-blocking functional readout',
    '3h ago',
    'approved-therapeutics.md',
    'Functional EGF blocking is measured as IC50 in a receptor-occupancy assay; correlates with buried surface area at the domain III ligand site.',
  ],
  [
    'Developability battery',
    '3h ago',
    'approved-therapeutics.md',
    'Early developability includes thermal stability (Tm by DSC), self-association (AC-SINS), poly-specificity (PSR), and high-concentration viscosity. Two flags demote a lead.',
  ],
  [
    'Effector function considerations',
    '3h ago',
    'approved-therapeutics.md',
    'ADCC potency is set by Fc afucosylation and epitope geometry. Not a primary gate for this campaign but recorded for lead ranking.',
  ],
  [
    'Combination and pairing strategy',
    '3h ago',
    'approved-therapeutics.md',
    'Non-overlapping epitope pairs drive superior receptor down-modulation. Orthogonal binders from binning are prioritized for combination testing.',
  ],
  [
    'Assay platform notes',
    '3h ago',
    'approved-therapeutics.md',
    'SPR is primary for kinetics with 1:1 fitting; BLI is an orthogonal rank-order check. KinExA is reserved for binders below the SPR affinity floor.',
  ],
]

const egfrMemories: Array<[title: string, updatedAgo: string, origin: string, detail: string]> = [
  [
    'KD gate set at 10 nM',
    '3h ago',
    'Untitled chat',
    'Agreed the affinity gate is KD ≤ 10 nM with a clean 1:1 fit; koff is informative only. Rationale tied to expected receptor occupancy at achievable serum concentrations.',
  ],
  [
    'Counter-screen against S492R',
    '3h ago',
    'Untitled chat',
    'Decision to add an S492R counter-screen so we do not advance leads that phenocopy cetuximab resistance.',
  ],
  [
    'Prefer orthogonal epitopes for pairing',
    '3h ago',
    'Untitled chat',
    'Flag orthogonal (non-domain-III-overlapping) binders during binning as combination candidates rather than dropping them.',
  ],
  [
    'Use SPR as primary, BLI as check',
    '3h ago',
    'Untitled chat',
    'SPR kinetics are the gating platform; BLI runs in parallel as an orthogonal affinity rank-order sanity check.',
  ],
  [
    'Two developability flags demote a lead',
    '3h ago',
    'Untitled chat',
    'Any two of {low Tm, high AC-SINS, high PSR, high viscosity} moves a candidate below the advancement line.',
  ],
  [
    'ADCC is a ranking factor, not a gate',
    '3h ago',
    'Untitled chat',
    'Effector function is recorded and used to break ties but does not independently gate advancement in this campaign.',
  ],
  [
    'Reference mAb panel locked',
    '3h ago',
    'Untitled chat',
    'Binning reference set fixed to cetuximab, matuzumab, panitumumab, necitumumab for reproducibility.',
  ],
  [
    'Chi²/Rmax threshold clarified',
    '3h ago',
    'Untitled chat',
    'A clean fit means Chi² under 10% of Rmax; borderline fits are re-run before rejection.',
  ],
  [
    'Ligand-blocking >50% advances',
    '3h ago',
    'Untitled chat',
    'Functional gate: block >50% of a reference response or be blocked by one to advance out of binning.',
  ],
]

const egfrResults: Array<[title: string, updatedAgo: string, origin: string, detail: string, match: number]> = [
  ['Clone 4G7 KD = 2.3 nM (1:1, clean)', '4h ago', 'run-egfr-spr-01', 'SPR kinetics: ka 4.1e5, kd 9.4e-4, KD 2.3 nM, Chi² 3.2% of Rmax. Passes the affinity gate.', 0.94],
  ['Clone 2B11 KD = 8.7 nM (borderline fit)', '4h ago', 'run-egfr-spr-01', 'KD within gate but Chi² 11% of Rmax; flagged for a re-run before advancing.', 0.71],
  ['Clone 9C3 KD = 41 nM (fails gate)', '4h ago', 'run-egfr-spr-01', 'Affinity above the 10 nM ceiling; does not advance.', 0.34],
  ['Clone 4G7 blocks cetuximab (bin A)', '5h ago', 'run-egfr-binning-01', 'Blocks >80% of cetuximab response — assigned to the dominant domain III community (bin A).', 0.88],
  ['Clone 7F2 orthogonal to bin A', '5h ago', 'run-egfr-binning-01', 'Neither blocks nor is blocked by bin A references; flagged as a pairing candidate.', 0.82],
  ['Clone 2B11 shares matuzumab bin', '5h ago', 'run-egfr-binning-01', 'Competes with matuzumab — conformation-locking community.', 0.68],
  ['S492R counter-screen: 4G7 retains binding', '6h ago', 'run-egfr-s492r-01', 'Clone 4G7 binds S492R EGFR (panitumumab-like tolerance); not a cetuximab phenocopy.', 0.9],
  ['S492R counter-screen: 5A9 loses binding', '6h ago', 'run-egfr-s492r-01', 'Clone 5A9 fails to bind S492R — resistance-prone, demoted.', 0.29],
  ['Ligand blocking IC50 = 3.1 nM (4G7)', '7h ago', 'run-egfr-block-01', 'EGF-blocking IC50 3.1 nM in receptor-occupancy assay; strong functional blocker.', 0.86],
  ['Tm 71°C, low self-association (4G7)', '8h ago', 'run-egfr-dev-01', 'DSC Tm 71°C, AC-SINS negative, PSR low — clean developability profile.', 0.8],
  ['High viscosity flag (3D6)', '8h ago', 'run-egfr-dev-01', 'Concentration-dependent viscosity above threshold plus mild PSR — two flags, demoted.', 0.3],
  ['ADCC potency rank (afucosylated 4G7)', '9h ago', 'run-egfr-adcc-01', 'Afucosylated 4G7 shows top-quartile ADCC; used as a tie-breaker in ranking.', 0.63],
]

function buildEgfrGraph(): KnowledgeGraph {
  const nodes: KnowledgeNode[] = []

  egfrSources.forEach(([title, updatedAgo, doi, abstract], i) => {
    nodes.push({
      id: `src-${i + 1}`,
      kind: 'source',
      title,
      summary: title,
      detail: abstract,
      updatedAgo,
      origin: title,
      citation: `doi:${doi}`,
      match: null,
    })
  })

  egfrChunks.forEach(([title, updatedAgo, origin, detail], i) => {
    nodes.push({
      id: `chunk-${i + 1}`,
      kind: 'chunk',
      title,
      summary: `Chunk of ${origin}`,
      detail,
      updatedAgo,
      origin,
      match: null,
    })
  })

  egfrMemories.forEach(([title, updatedAgo, origin, detail], i) => {
    nodes.push({
      id: `mem-${i + 1}`,
      kind: 'memory',
      title,
      summary: `Memory from ${origin}`,
      detail,
      updatedAgo,
      origin,
      match: null,
    })
  })

  egfrResults.forEach(([title, updatedAgo, origin, detail, match], i) => {
    nodes.push({
      id: `res-${i + 1}`,
      kind: 'result',
      title,
      summary: `Result from ${origin}`,
      detail,
      updatedAgo,
      origin,
      match,
    })
  })

  const edges = generateEdges(nodes, hashSeed('egfr-lead-triage'))
  return { nodes, edges }
}

/* ------------------------------------------------------------------ */
/* Edge generation                                                     */
/* ------------------------------------------------------------------ */

/**
 * Links nodes by shared context. Chunks and results "cite" a couple of
 * sources each; memories and sources form softer "semantic" matches. The
 * result is a connected, Obsidian-style web without hand-authoring every
 * edge.
 */
function generateEdges(nodes: KnowledgeNode[], seed: number): KnowledgeEdge[] {
  const rng = makeRng(seed)
  const byKind = (kind: KnowledgeNodeKind) => nodes.filter((n) => n.kind === kind)
  const sources = byKind('source')
  const chunks = byKind('chunk')
  const memories = byKind('memory')
  const results = byKind('result')

  const edges: KnowledgeEdge[] = []
  const seen = new Set<string>()
  const add = (source: string, target: string, kind: KnowledgeEdge['kind']) => {
    if (source === target) return
    const key = [source, target].sort().join('|')
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ source, target, kind })
  }

  const pick = <T,>(arr: T[], count: number): T[] => {
    if (arr.length <= count) return arr.slice()
    const pool = arr.slice()
    const out: T[] = []
    for (let i = 0; i < count && pool.length; i++) {
      out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0])
    }
    return out
  }

  // Chunks cite 1–3 sources.
  for (const chunk of chunks) {
    for (const src of pick(sources, 1 + Math.floor(rng() * 3))) {
      add(chunk.id, src.id, 'cited')
    }
  }

  // Results cite 1–2 sources and attach to a related chunk.
  for (const res of results) {
    for (const src of pick(sources, 1 + Math.floor(rng() * 2))) {
      add(res.id, src.id, 'cited')
    }
    for (const chunk of pick(chunks, 1)) add(res.id, chunk.id, 'semantic')
  }

  // Memories semantically match chunks, results, and the odd source.
  for (const mem of memories) {
    for (const chunk of pick(chunks, 1 + Math.floor(rng() * 2))) {
      add(mem.id, chunk.id, 'semantic')
    }
    for (const res of pick(results, 1)) add(mem.id, res.id, 'semantic')
    if (rng() > 0.5) for (const src of pick(sources, 1)) add(mem.id, src.id, 'semantic')
  }

  // Sprinkle source↔source semantic matches so the sea of sources coheres.
  for (const src of sources) {
    if (rng() > 0.45) {
      for (const other of pick(sources, 1)) add(src.id, other.id, 'semantic')
    }
  }

  return edges
}

/* ------------------------------------------------------------------ */
/* Fallback graph for campaigns without an authored dataset            */
/* ------------------------------------------------------------------ */

/** Derives a modest graph from a campaign's files, goals, and runs so every
 *  Knowledge tab renders something coherent rather than an empty canvas. */
function buildFallbackGraph(campaign: Campaign): KnowledgeGraph {
  const nodes: KnowledgeNode[] = []

  campaign.files.forEach((file, i) => {
    nodes.push({
      id: `chunk-${i + 1}`,
      kind: 'chunk',
      title: file.name,
      summary: `Indexed document · ${file.type}`,
      detail: `${file.name} (${file.size}). ${file.indexed ? 'Indexed into the campaign knowledge base.' : 'Pending indexing.'}`,
      updatedAgo: campaign.updatedAgo,
      origin: file.name,
      match: null,
    })
  })

  campaign.goals.forEach((goal, gi) => {
    nodes.push({
      id: `mem-${gi + 1}`,
      kind: 'memory',
      title: goal.title,
      summary: `Goal ${goal.code}`,
      detail: goal.description,
      updatedAgo: campaign.updatedAgo,
      origin: `Goal ${goal.code}`,
      match: null,
    })
    goal.assays.forEach((assay, ai) => {
      nodes.push({
        id: `res-${gi + 1}-${ai + 1}`,
        kind: 'result',
        title: assay.name,
        summary: `Assay · ${assay.status}`,
        detail: `${assay.name} (${assay.experimentId}), ${assay.runCount} run${assay.runCount === 1 ? '' : 's'} across ${assay.versions} version${assay.versions === 1 ? '' : 's'}.`,
        updatedAgo: campaign.updatedAgo,
        origin: assay.experimentId,
        match: goal.status === 'completed' ? 0.8 : 0.5,
      })
    })
  })

  // A couple of placeholder external sources so the web isn't all internal.
  for (let i = 0; i < 4; i++) {
    nodes.push({
      id: `src-${i + 1}`,
      kind: 'source',
      title: `${campaign.name} reference ${i + 1}`,
      summary: 'External source',
      detail: `Reference literature linked to ${campaign.name}.`,
      updatedAgo: campaign.updatedAgo,
      origin: 'External',
      citation: 'doi:—',
      match: null,
    })
  }

  const edges = generateEdges(nodes, hashSeed(campaign.id))
  return { nodes, edges }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

const authoredGraphs: Record<string, () => KnowledgeGraph> = {
  'egfr-lead-triage': buildEgfrGraph,
}

export function getKnowledgeGraph(campaignId: string): KnowledgeGraph {
  const authored = authoredGraphs[campaignId]
  if (authored) return authored()
  const campaign = getCampaignById(campaignId)
  if (!campaign) return { nodes: [], edges: [] }
  return buildFallbackGraph(campaign)
}

export interface KnowledgeCounts {
  chunk: number
  memory: number
  result: number
  source: number
}

export function countByKind(graph: KnowledgeGraph): KnowledgeCounts {
  const counts: KnowledgeCounts = { chunk: 0, memory: 0, result: 0, source: 0 }
  for (const node of graph.nodes) counts[node.kind]++
  return counts
}
