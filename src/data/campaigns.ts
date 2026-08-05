import type { Chat, Campaign, Organization, Run, User } from './types'

export const currentUser: User = {
  name: 'Dev User',
  role: 'Scientist',
}

export const organization: Organization = {
  name: 'Medra Bio Labs',
  plan: 'Research',
}

export const campaigns: Campaign[] = [
  {
    id: 'egfr-lead-triage',
    name: 'EGFR Lead Triage',
    status: 'planned',
    createdAgo: '2d ago',
    updatedAgo: '3h ago',
    objective: null,
    progressPercent: 0,
    goals: [],
    assayCount: 0,
    files: [
      {
        id: 'file-1',
        name: 'approved-therapeutics.md',
        type: 'MD',
        size: '994 B',
        indexed: true,
      },
    ],
  },
  {
    id: 'kras-g12c-screen',
    name: 'KRAS G12C Screen',
    status: 'active',
    createdAgo: '3w ago',
    updatedAgo: '25m ago',
    objective:
      'Identify covalent inhibitors with sub-micromolar potency against KRAS G12C.',
    progressPercent: 62,
    goals: [
      {
        id: 'g1',
        title: 'Primary binding assay across compound library',
        status: 'completed',
      },
      {
        id: 'g2',
        title: 'Dose-response confirmation for top 48 hits',
        status: 'active',
      },
      {
        id: 'g3',
        title: 'Selectivity panel vs. wild-type KRAS',
        status: 'active',
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
  },
  {
    id: 'her2-adc-linker',
    name: 'HER2 ADC Linker Stability',
    status: 'completed',
    createdAgo: '2mo ago',
    updatedAgo: '1w ago',
    objective:
      'Characterize plasma stability of three cleavable linker chemistries.',
    progressPercent: 100,
    goals: [
      {
        id: 'g4',
        title: 'Plasma stability timecourse for each linker',
        status: 'completed',
      },
      {
        id: 'g5',
        title: 'Payload release quantification by LC-MS',
        status: 'completed',
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
  },
]

export const runs: Run[] = [
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
