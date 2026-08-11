import type {
  Chat,
  Campaign,
  Organization,
  PlanVariant,
  Run,
  User,
} from './types'

export const currentUser: User = {
  name: 'Dev User',
  role: 'Scientist',
}

export const organization: Organization = {
  name: 'Medra Bio Labs',
  plan: 'Research',
}

/** Alternative campaign designs for EGFR Lead Triage — one per optimization
 *  axis. Same five gates every time; only the sequencing and triage logic
 *  change between variants. */
const egfrPlanVariants: PlanVariant[] = [
  {
    id: 'variant-egfr-speed',
    axis: 'Speed',
    title: 'Speed-First — Parallel Fast SPR Triage',
    summary:
      'Front-load one fast single-concentration SPR pass across the whole panel, hard-triage on binding response, then run the downstream gates in parallel on the survivors to compress the timeline.',
    goals:
      'Keep all five gates, but front-load a single fast single-concentration SPR pass to rank the whole panel by binding response, and hard-triage early. Only the top binders go on to a full kinetic titration that confirms KD ≤ 10 nM with a clean 1:1 fit (off-rate is not a gate). Epitope Binning maps the survivors; Cell Binding & Blocking (A431 EC50 / EGF-blocking IC50) and General Specificity (PSR) then run on the finalists, and Developability (DSF Tm, AC-SINS) runs in parallel on the binding-qualified set.',
    stages: [
      { id: 's1', steps: ['Single-conc SPR triage'] },
      { id: 's2', steps: ['Full kinetic titration'] },
      { id: 's3', steps: ['Epitope binning'] },
      {
        id: 's4',
        steps: [
          'Cell binding & blocking',
          'General specificity (PSR)',
          'Developability panel',
        ],
      },
    ],
  },
  {
    id: 'variant-egfr-cost',
    axis: 'Cost',
    title: 'Cost-First — Sequential Hard Gates',
    summary:
      'Run the cheapest gates first and cull hard at every step, so the expensive cell-based and developability assays only ever see a handful of finalists.',
    goals:
      'Order the five gates strictly by cost per candidate. SPR Kinetics runs first and drops everything above KD 10 nM or without a clean 1:1 fit. Epitope Binning then removes redundant bins so only one representative per epitope advances. General Specificity (PSR) is the last cheap filter before the expensive assays: Cell Binding & Blocking (A431 EC50 / EGF-blocking IC50) runs on the short list, and Developability (DSF Tm, AC-SINS) is reserved for the final three to five candidates.',
    stages: [
      { id: 's1', steps: ['SPR kinetics'] },
      { id: 's2', steps: ['Epitope binning'] },
      { id: 's3', steps: ['General specificity (PSR)'] },
      { id: 's4', steps: ['Cell binding & blocking'] },
      { id: 's5', steps: ['Developability panel'] },
    ],
  },
  {
    id: 'variant-egfr-creativity',
    axis: 'Creativity',
    title: 'Creativity-First — Epitope-Led Exploration',
    summary:
      'Lead with epitope binning to map the whole binding landscape first, then deliberately advance candidates from underexplored bins instead of just the tightest binders.',
    goals:
      'Epitope Binning moves to the front so the panel is characterized by where it binds before how tightly. Each bin — including those orthogonal to cetuximab and panitumumab — nominates its best representative, and rare bins get a lower affinity bar to keep unusual chemistry alive. SPR Kinetics (KD ≤ 10 nM, clean 1:1 fit) then confirms the nominees, Cell Binding & Blocking and General Specificity (PSR) run per bin, and Developability (DSF Tm, AC-SINS) qualifies whichever bin champions survive.',
    stages: [
      { id: 's1', steps: ['Epitope binning'] },
      { id: 's2', steps: ['Bin champion picks'] },
      { id: 's3', steps: ['Kinetic titration'] },
      {
        id: 's4',
        steps: ['Cell binding & blocking', 'General specificity (PSR)'],
      },
      { id: 's5', steps: ['Developability panel'] },
    ],
  },
  {
    id: 'variant-egfr-robustness',
    axis: 'Robustness',
    title: 'Robustness-First — Orthogonal Confirmation',
    summary:
      'Every gate is confirmed by a second, orthogonal readout before a candidate advances, trading throughput for confidence that no lead is carried forward on a single measurement.',
    goals:
      'Each of the five gates keeps its threshold but adds an orthogonal check. SPR Kinetics (KD ≤ 10 nM, clean 1:1 fit) is re-run at a second surface density, epitope bins are confirmed in both sandwich orientations, and Cell Binding & Blocking pairs the A431 EC50 with an EGF-blocking IC50 on a second cell line. General Specificity (PSR) is cross-checked against a baculovirus particle ELISA, and Developability requires agreement between DSF Tm and AC-SINS before a candidate is called lead-ready.',
    stages: [
      { id: 's1', steps: ['Kinetics, density 1', 'Kinetics, density 2'] },
      { id: 's2', steps: ['Binning A→B', 'Binning B→A'] },
      { id: 's3', steps: ['Cell binding & blocking'] },
      { id: 's4', steps: ['PSR', 'BVP ELISA'] },
      { id: 's5', steps: ['DSF Tm', 'AC-SINS'] },
    ],
  },
  {
    id: 'variant-egfr-novelty',
    axis: 'Novelty',
    title: 'Novelty-First — Non-Competitive Bin Hunt',
    summary:
      'Prioritize candidates that bind outside the epitopes of approved therapeutics, accepting a longer path in exchange for leads with genuinely new mechanisms.',
    goals:
      'Epitope Binning runs against the full approved-therapeutic panel (cetuximab, matuzumab, panitumumab, necitumumab) first, and anything that competes with an approved mAb is deprioritized rather than advanced. Non-competitive binders go through the standard SPR Kinetics gate (KD ≤ 10 nM, clean 1:1 fit), then Cell Binding & Blocking must show A431 binding with EGF-blocking activity to prove the new epitope is still functional. General Specificity (PSR) and Developability (DSF Tm, AC-SINS) close out the novel set.',
    stages: [
      { id: 's1', steps: ['Binning vs. approved mAbs'] },
      { id: 's2', steps: ['Non-competitive triage'] },
      { id: 's3', steps: ['Kinetic titration'] },
      { id: 's4', steps: ['Cell binding & blocking'] },
      {
        id: 's5',
        steps: ['General specificity (PSR)', 'Developability panel'],
      },
    ],
  },
]

const krasPlanVariants: PlanVariant[] = [
  {
    id: 'variant-kras-speed',
    axis: 'Speed',
    title: 'Speed-First — Single-Dose Sprint',
    summary:
      'Collapse the primary screen to one dose, take a generous hit cut, and run dose-response and selectivity in parallel on the survivors.',
    goals:
      'Screen the full library at a single 10 µM dose and advance anything above 50% engagement without replicate confirmation. Dose-response titration and the wild-type KRAS selectivity panel then run in parallel on the same plates, so a confirmed sub-micromolar, selective covalent hit list lands in roughly half the calendar time.',
    stages: [
      { id: 's1', steps: ['Single-dose screen'] },
      { id: 's2', steps: ['Hit cut ≥50% engagement'] },
      { id: 's3', steps: ['Dose-response titration', 'WT selectivity panel'] },
    ],
  },
  {
    id: 'variant-kras-cost',
    axis: 'Cost',
    title: 'Cost-First — Staged Plate Budget',
    summary:
      'Screen in pools, deconvolute only the active pools, and hold the selectivity panel for confirmed sub-micromolar hits to minimize protein and plate spend.',
    goals:
      'Pool the library eight compounds per well for the primary screen and deconvolute only wells above threshold, cutting primary plate count by ~80%. Dose-response runs on deconvoluted singles with duplicate rather than quadruplicate replicates, and the wild-type KRAS selectivity panel is reserved for hits with confirmed sub-micromolar IC50s.',
    stages: [
      { id: 's1', steps: ['Pooled primary screen'] },
      { id: 's2', steps: ['Pool deconvolution'] },
      { id: 's3', steps: ['Dose-response, duplicates'] },
      { id: 's4', steps: ['WT selectivity panel'] },
    ],
  },
  {
    id: 'variant-kras-creativity',
    axis: 'Creativity',
    title: 'Creativity-First — Scaffold-Led Selection',
    summary:
      'Cluster the library by chemotype before screening and advance the best representative of every scaffold family, not just the most potent wells.',
    goals:
      'Cluster the compound library into scaffold families first, then screen with per-family champions in mind: each chemotype nominates its top binder even if it sits below the global potency cut. Dose-response confirms the nominees, and the wild-type selectivity panel runs across the full scaffold-diverse set so lead chemistry starts with multiple distinct series instead of one crowded one.',
    stages: [
      { id: 's1', steps: ['Scaffold clustering'] },
      { id: 's2', steps: ['Primary screen'] },
      { id: 's3', steps: ['Per-family champion picks'] },
      { id: 's4', steps: ['Dose-response titration'] },
      { id: 's5', steps: ['WT selectivity panel'] },
    ],
  },
  {
    id: 'variant-kras-robustness',
    axis: 'Robustness',
    title: 'Robustness-First — Orthogonal Engagement Proof',
    summary:
      'Confirm every gate with a second readout — intact-mass adduct formation alongside the biochemical assay — before any hit is called real.',
    goals:
      'Every primary hit must show covalent adduct formation by intact-mass LC-MS in addition to the biochemical engagement signal. Dose-response runs in quadruplicate across two independent protein preps, and the selectivity gate pairs the wild-type KRAS panel with a G12D counter-screen so only hits selective by both measures advance to lead chemistry.',
    stages: [
      { id: 's1', steps: ['Primary screen', 'Intact-mass LC-MS'] },
      { id: 's2', steps: ['Dose-response, prep A', 'Dose-response, prep B'] },
      { id: 's3', steps: ['WT selectivity', 'G12D counter-screen'] },
    ],
  },
  {
    id: 'variant-kras-novelty',
    axis: 'Novelty',
    title: 'Novelty-First — New Warhead Hunt',
    summary:
      'Deprioritize acrylamide look-alikes of known G12C chemotypes and push the screen toward unusual warheads and binding modes.',
    goals:
      'Flag compounds structurally similar to disclosed G12C inhibitors (sotorasib, adagrasib chemotypes) and deprioritize them at the primary screen. Novel warheads and scaffolds get a relaxed potency bar into dose-response, and confirmed novel hits go through the wild-type selectivity panel plus a reversibility check to characterize what a genuinely new covalent series looks like.',
    stages: [
      { id: 's1', steps: ['Known-chemotype flagging'] },
      { id: 's2', steps: ['Primary screen, novel-first'] },
      { id: 's3', steps: ['Dose-response titration'] },
      { id: 's4', steps: ['WT selectivity panel', 'Reversibility check'] },
    ],
  },
]

const her2PlanVariants: PlanVariant[] = [
  {
    id: 'variant-her2-speed',
    axis: 'Speed',
    title: 'Speed-First — Compressed Timecourse',
    summary:
      'Run all three linkers in one plasma batch with abbreviated timepoints, and start LC-MS payload quantification as soon as the first samples freeze down.',
    goals:
      'All three cleavable linkers run in a single plasma stability batch with timepoints at 0, 24, and 96h instead of the full eight-point curve. LC-MS payload release starts on the 24h samples while the timecourse is still running, so cleavage kinetics and stability rankings arrive together instead of sequentially.',
    stages: [
      { id: 's1', steps: ['3-linker plasma batch'] },
      { id: 's2', steps: ['0/24/96h timepoints'] },
      { id: 's3', steps: ['LC-MS on early samples', 'Timecourse completion'] },
    ],
  },
  {
    id: 'variant-her2-cost',
    axis: 'Cost',
    title: 'Cost-First — Endpoint Screen, Winner Timecourse',
    summary:
      'Screen all linkers at a single 96h endpoint first, and spend the full timecourse and LC-MS budget only on the most stable chemistry.',
    goals:
      'Run a single 96h endpoint stability check across all three linkers to rank them cheaply. Only the winner (and runner-up if within error) gets the full 96h timecourse with complete timepoints, and LC-MS payload release quantification is reserved for that finalist, cutting instrument time to a third.',
    stages: [
      { id: 's1', steps: ['96h endpoint screen'] },
      { id: 's2', steps: ['Winner selection'] },
      { id: 's3', steps: ['Full timecourse, winner'] },
      { id: 's4', steps: ['LC-MS payload release'] },
    ],
  },
  {
    id: 'variant-her2-creativity',
    axis: 'Creativity',
    title: 'Creativity-First — Cross-Matrix Comparison',
    summary:
      'Run each linker across human, mouse, and cyno plasma in parallel to surface species-dependent cleavage modes the standard protocol would miss.',
    goals:
      'Instead of one plasma source, each cleavable linker runs its timecourse in human, mouse, and cynomolgus plasma side by side. Divergent cleavage between species flags enzyme-specific liabilities early, and LC-MS payload release is compared across matrices so the chosen linker is stable for the reasons we think it is.',
    stages: [
      { id: 's1', steps: ['Human plasma', 'Mouse plasma', 'Cyno plasma'] },
      { id: 's2', steps: ['Cross-species comparison'] },
      { id: 's3', steps: ['LC-MS payload release'] },
    ],
  },
  {
    id: 'variant-her2-robustness',
    axis: 'Robustness',
    title: 'Robustness-First — Replicated Orthogonal Readout',
    summary:
      'Duplicate every timecourse across independent plasma lots and require ELISA and LC-MS to agree before a stability call is made.',
    goals:
      'Each linker\u2019s 96h timecourse runs in duplicate across two independent plasma lots to control for donor variability. Payload release is quantified by both LC-MS and an orthogonal ELISA against free payload, and a linker is only called stable when both readouts agree across both lots.',
    stages: [
      { id: 's1', steps: ['Timecourse, lot A', 'Timecourse, lot B'] },
      { id: 's2', steps: ['LC-MS quantification', 'Free-payload ELISA'] },
      { id: 's3', steps: ['Concordance gate'] },
    ],
  },
  {
    id: 'variant-her2-novelty',
    axis: 'Novelty',
    title: 'Novelty-First — Expanded Linker Panel',
    summary:
      'Add two experimental linker chemistries and a non-cleavable control to the panel, using the three known linkers as calibration rather than the whole story.',
    goals:
      'The three cleavable linkers are joined by two experimental chemistries and a non-cleavable control that anchors the stability ceiling. The full panel runs the same 96h plasma timecourse and LC-MS payload release, so the known chemistries calibrate the assay while the experimental ones get a fair, directly comparable shot at outperforming them.',
    stages: [
      { id: 's1', steps: ['Panel + 2 experimental', 'Non-cleavable control'] },
      { id: 's2', steps: ['96h plasma timecourse'] },
      { id: 's3', steps: ['LC-MS payload release'] },
    ],
  },
]

export const campaigns: Campaign[] = [
  {
    id: 'egfr-lead-triage',
    name: 'EGFR Lead Triage',
    status: 'planned',
    createdAgo: '2d ago',
    updatedAgo: '3h ago',
    startDate: '5/4/2026',
    targetDate: '5/25/2026',
    lead: null,
    versions: 1,
    objective:
      'Identify anti-EGFR antibodies with the affinity, epitope coverage, functional ligand blocking, general specificity, and developability to advance to lead selection.',
    progressPercent: 0,
    goals: [
      {
        id: 'g-egfr-1',
        code: 'G01',
        title: 'Kinetics',
        description:
          'Candidates pass with KD ≤ 10 nM and a clean 1:1 fit (Chi² under 10% of Rmax); koff is not a gate. Clean single-site binders advance to epitope binning.',
        status: 'planned',
        targetDate: null,
        assays: [
          {
            id: 'assay-egfr-spr',
            name: 'SPR Kinetics',
            status: 'draft',
            versions: 1,
            runCount: 0,
            experimentId: 'exp-egfr-spr',
          },
        ],
      },
      {
        id: 'g-egfr-2',
        code: 'G02',
        title: 'Epitope Binning',
        description:
          'Map competitive epitopes vs. cetuximab, matuzumab, panitumumab, and necitumumab. Candidates that block >50% of a reference mAb response, or are blocked by one, advance; orthogonal binders are flagged for pairing.',
        status: 'planned',
        targetDate: null,
        assays: [
          {
            id: 'assay-egfr-binning',
            name: 'Epitope Binning (Classical Sandwich)',
            status: 'draft',
            versions: 1,
            runCount: 0,
            experimentId: 'exp-egfr-binning',
          },
        ],
      },
    ],
    assayCount: 2,
    files: [
      {
        id: 'file-1',
        name: 'approved-therapeutics.md',
        type: 'MD',
        size: '994 B',
        indexed: true,
      },
    ],
    planVariants: egfrPlanVariants,
  },
  {
    id: 'kras-g12c-screen',
    name: 'KRAS G12C Screen',
    status: 'active',
    createdAgo: '3w ago',
    updatedAgo: '25m ago',
    startDate: '7/14/2026',
    targetDate: '8/18/2026',
    lead: 'Dev User',
    versions: 4,
    objective:
      'Identify covalent inhibitors with sub-micromolar potency against KRAS G12C.',
    progressPercent: 62,
    goals: [
      {
        id: 'g1',
        code: 'G01',
        title: 'Primary binding assay across compound library',
        description:
          'Screen the compound library for covalent binders to KRAS G12C and triage hits for dose-response.',
        status: 'completed',
        targetDate: '7/28/2026',
        assays: [
          {
            id: 'assay-kras-primary',
            name: 'Primary binding screen',
            status: 'completed',
            versions: 2,
            runCount: 4,
            experimentId: 'exp-kras-primary',
          },
        ],
      },
      {
        id: 'g2',
        code: 'G02',
        title: 'Dose-response confirmation for top 48 hits',
        description:
          'Confirm sub-micromolar potency across replicates for the top 48 primary hits.',
        status: 'active',
        targetDate: '8/8/2026',
        assays: [
          {
            id: 'assay-kras-dr',
            name: 'Dose-response titration',
            status: 'running',
            versions: 3,
            runCount: 3,
            experimentId: 'exp-kras-dr',
          },
        ],
      },
      {
        id: 'g3',
        code: 'G03',
        title: 'Selectivity panel vs. wild-type KRAS',
        description:
          'Measure selectivity of confirmed hits against wild-type KRAS before committing to lead chemistry.',
        status: 'active',
        targetDate: '8/18/2026',
        assays: [
          {
            id: 'assay-kras-sel',
            name: 'WT KRAS selectivity panel',
            status: 'ready',
            versions: 1,
            runCount: 0,
            experimentId: 'exp-kras-sel',
          },
        ],
      },
    ],
    assayCount: 4,
    files: [
      {
        id: 'file-2',
        name: 'compound-library.csv',
        type: 'CSV',
        size: '2.1 MB',
        indexed: true,
      },
      {
        id: 'file-3',
        name: 'assay-protocol-v3.pdf',
        type: 'PDF',
        size: '412 KB',
        indexed: true,
      },
      {
        id: 'file-4',
        name: 'hit-triage-notes.md',
        type: 'MD',
        size: '6.8 KB',
        indexed: false,
      },
    ],
    planVariants: krasPlanVariants,
  },
  {
    id: 'her2-adc-linker',
    name: 'HER2 ADC Linker Stability',
    status: 'completed',
    createdAgo: '2mo ago',
    updatedAgo: '1w ago',
    startDate: '5/20/2026',
    targetDate: '7/1/2026',
    lead: 'Dev User',
    versions: 7,
    objective:
      'Characterize plasma stability of three cleavable linker chemistries.',
    progressPercent: 100,
    goals: [
      {
        id: 'g4',
        code: 'G01',
        title: 'Plasma stability timecourse for each linker',
        description:
          'Run a 96h plasma stability timecourse for each cleavable linker chemistry.',
        status: 'completed',
        targetDate: '6/15/2026',
        assays: [
          {
            id: 'assay-her2-plasma',
            name: 'Plasma stability timecourse',
            status: 'completed',
            versions: 2,
            runCount: 3,
            experimentId: 'exp-her2-plasma',
          },
        ],
      },
      {
        id: 'g5',
        code: 'G02',
        title: 'Payload release quantification by LC-MS',
        description:
          'Quantify payload release for each linker by LC-MS and compare cleavage kinetics.',
        status: 'completed',
        targetDate: '7/1/2026',
        assays: [
          {
            id: 'assay-her2-lcms',
            name: 'LC-MS payload release',
            status: 'completed',
            versions: 1,
            runCount: 2,
            experimentId: 'exp-her2-lcms',
          },
        ],
      },
    ],
    assayCount: 2,
    files: [
      {
        id: 'file-5',
        name: 'linker-panel.json',
        type: 'JSON',
        size: '18 KB',
        indexed: true,
      },
      {
        id: 'file-6',
        name: 'final-report.pdf',
        type: 'PDF',
        size: '1.4 MB',
        indexed: true,
      },
    ],
    planVariants: her2PlanVariants,
  },
]

export const runs: Run[] = [
  {
    id: 'run-120',
    name: 'SPR single-concentration triage, plate A',
    campaignName: 'EGFR Lead Triage',
    status: 'queued',
    startedAgo: '—',
    duration: '—',
  },
  {
    id: 'run-119',
    name: 'Dose-response plate 4 of 4',
    campaignName: 'KRAS G12C Screen',
    status: 'queued',
    startedAgo: '—',
    duration: '—',
  },
  {
    id: 'run-118',
    name: 'Dose-response plate 3 of 4',
    campaignName: 'KRAS G12C Screen',
    status: 'running',
    startedAgo: '25m ago',
    duration: '—',
  },
  {
    id: 'run-117',
    name: 'Dose-response plate 2 of 4',
    campaignName: 'KRAS G12C Screen',
    status: 'succeeded',
    startedAgo: '4h ago',
    duration: '1h 42m',
  },
  {
    id: 'run-116',
    name: 'Selectivity panel calibration',
    campaignName: 'KRAS G12C Screen',
    status: 'failed',
    startedAgo: '1d ago',
    duration: '12m',
  },
  {
    id: 'run-115',
    name: 'Plasma stability timecourse, 96h',
    campaignName: 'HER2 ADC Linker Stability',
    status: 'succeeded',
    startedAgo: '1w ago',
    duration: '96h 20m',
  },
  {
    id: 'run-114',
    name: 'Epitope binning vs approved panel',
    campaignName: 'EGFR Lead Triage',
    status: 'succeeded',
    startedAgo: '1w ago',
    duration: '3h 08m',
  },
  {
    id: 'run-113',
    name: 'LC-MS payload release, lot B',
    campaignName: 'HER2 ADC Linker Stability',
    status: 'succeeded',
    startedAgo: '2w ago',
    duration: '5h 14m',
  },
  {
    id: 'run-112',
    name: 'Primary screen pool deconvolution',
    campaignName: 'KRAS G12C Screen',
    status: 'failed',
    startedAgo: '2w ago',
    duration: '48m',
  },
  {
    id: 'run-111',
    name: 'SPR kinetic titration, top binders',
    campaignName: 'EGFR Lead Triage',
    status: 'succeeded',
    startedAgo: '3w ago',
    duration: '6h 22m',
  },
]

export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find((campaign) => campaign.id === id)
}

/** Seed chats keyed by campaign id. A fresh campaign starts with one
 *  empty conversation so the AI Experimentalist has somewhere to land. */
export const campaignChats: Record<string, Chat[]> = {
  'egfr-lead-triage': [
    {
      id: 'chat-egfr-1',
      title: 'Untitled chat',
      updatedAgo: '3h ago',
      author: 'Dev User',
      messages: [],
    },
  ],
  'kras-g12c-screen': [
    {
      id: 'chat-kras-1',
      title: 'Dose-response triage',
      updatedAgo: '25m ago',
      author: 'Dev User',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content:
            'Summarize where the top 48 hits stand after the latest dose-response plate.',
        },
        {
          id: 'm2',
          role: 'assistant',
          content:
            '31 of the 48 hits have confirmed sub-micromolar IC50s across both replicates. 9 are borderline (1–3 µM) and worth a selectivity check before we commit plate time, and 8 dropped out as likely assay artifacts. Want me to draft the selectivity panel goal against wild-type KRAS?',
        },
      ],
    },
  ],
}

export function getChatsForCampaign(campaignId: string): Chat[] {
  return campaignChats[campaignId] ?? []
}
