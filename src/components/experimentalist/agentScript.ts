import type { Campaign, CampaignGoal } from '@/data/types'

/**
 * Scripted Experimentalist brain — matches the user's message against a few
 * intents and composes a reply from the campaign's real data (goals, assays,
 * files, variants), so the demo reads as context-aware without a model.
 */

export interface ScriptedReply {
  content: string
  attachment?: 'plan-variants'
}

const STATUS_LABEL: Record<string, string> = {
  planned: 'planned',
  active: 'in progress',
  completed: 'complete',
  draft: 'still in draft',
  ready: 'ready to run',
  running: 'running now',
}

function describeGoal(goal: CampaignGoal): string {
  const assays = goal.assays
    .map((assay) => {
      const runs =
        assay.runCount === 0
          ? 'no runs yet'
          : `${assay.runCount} run${assay.runCount === 1 ? '' : 's'} logged`
      return `${assay.name} is ${STATUS_LABEL[assay.status] ?? assay.status} (${runs})`
    })
    .join('; ')
  const target = goal.targetDate ? `, targeting ${goal.targetDate}` : ''
  return `**${goal.code} ${goal.title}** — ${STATUS_LABEL[goal.status] ?? goal.status}${target}. ${assays}.`
}

function goalsStatusReply(campaign: Campaign): string {
  const header =
    campaign.progressPercent > 0
      ? `${campaign.name} is ${campaign.progressPercent}% through its gates. Here\u2019s where each goal stands:`
      : `${campaign.name} hasn\u2019t started executing yet — everything is staged. Here\u2019s where each goal stands:`
  const goalLines = campaign.goals.map((goal) => `- ${describeGoal(goal)}`)
  const drafts = campaign.goals
    .flatMap((goal) => goal.assays)
    .filter((assay) => assay.status === 'draft')
  const closer =
    drafts.length > 0
      ? `The blocker right now is that ${drafts.map((assay) => assay.name).join(' and ')} ${drafts.length === 1 ? 'is' : 'are'} still in draft. Want me to finalize ${drafts.length === 1 ? 'it' : 'them'} so the first runs can queue?`
      : campaign.progressPercent === 100
        ? 'All gates are closed out — this campaign is done. I can draft a summary report if you want one.'
        : 'Nothing is blocked on setup — the active assays just need their remaining runs to land.'
  return [header, goalLines.join('\n'), closer].join('\n\n')
}

function nextFocusReply(campaign: Campaign): string {
  const nextGoal =
    campaign.goals.find((goal) => goal.status === 'active') ??
    campaign.goals.find((goal) => goal.status === 'planned')
  if (!nextGoal) {
    return `${campaign.name} is fully complete — every goal has closed. The highest-leverage next step is a retrospective: I can pull the run data and draft what worked and what to change for the next campaign.`
  }
  const assay = nextGoal.assays.find((a) => a.status !== 'completed')
  const action = assay
    ? assay.status === 'draft'
      ? `finalize the drafted ${assay.name} assay and queue its first run`
      : assay.status === 'ready'
        ? `kick off ${assay.name} — it\u2019s ready and just needs a run scheduled`
        : `watch ${assay.name}, which is mid-run — results should gate the next decision`
    : `close out ${nextGoal.code}`
  return `Focus on ${nextGoal.code} ${nextGoal.title}. It\u2019s the gate everything downstream depends on: ${nextGoal.description} The concrete next step is to ${action}. I can set that up now if you want.`
}

function knowledgeReply(campaign: Campaign): string {
  const files = campaign.files.filter((file) => !file.isFolder)
  if (files.length === 0) {
    return 'The knowledge base for this campaign is empty. Upload protocols, reference panels, or prior results and I\u2019ll index them so goals and assay designs can cite them.'
  }
  const indexed = files.filter((file) => file.indexed)
  const pending = files.filter((file) => !file.indexed)
  const parts = [
    `I\u2019m grounded on ${indexed.length} indexed file${indexed.length === 1 ? '' : 's'}: ${indexed.map((file) => file.name).join(', ')}.`,
  ]
  if (pending.length > 0) {
    parts.push(
      `${pending.map((file) => file.name).join(', ')} ${pending.length === 1 ? 'is' : 'are'} uploaded but not indexed yet, so I can\u2019t cite ${pending.length === 1 ? 'it' : 'them'} until indexing finishes.`,
    )
  }
  parts.push(
    'Everything indexed also feeds the knowledge graph, so results and citations stay linked back to their sources.',
  )
  return parts.join(' ')
}

function objectiveReply(campaign: Campaign): string {
  if (!campaign.objective) {
    return `${campaign.name} doesn\u2019t have an objective set yet. Give me one sentence on what a win looks like and I\u2019ll draft measurable goals and the assays each one needs.`
  }
  return `The objective on file: ${campaign.objective} Every goal in this campaign is a gate toward that — ${campaign.goals.map((goal) => `${goal.code} (${goal.title.toLowerCase()})`).join(', ')}. Ask me where the goals stand if you want the current state of each gate.`
}

const FALLBACKS = [
  (campaign: Campaign) =>
    `Got it. I\u2019ll pull the ${campaign.name} context and knowledge base, then propose next steps for you to approve.`,
  (campaign: Campaign) =>
    `Here\u2019s how I\u2019d sequence that: confirm it against the objective, check which of the ${campaign.goals.length} goals it touches, then draft the assay changes. Sound right?`,
  (campaign: Campaign) =>
    `I can turn that into a concrete plan for ${campaign.name}. Want me to draft it now, or review the indexed files first?`,
]

let fallbackIndex = 0

export function composeReply(
  campaign: Campaign,
  userText: string,
): ScriptedReply {
  const text = userText.toLowerCase()

  if (
    campaign.planVariants.length > 0 &&
    /alternat|variant|redesign|other (plan|design)|different (plan|design|approach)/.test(
      text,
    )
  ) {
    return {
      content:
        'I explored several alternative plans — each optimized for a different priority. The gates stay the same; what changes is how they\u2019re sequenced and how hard each one triages. Compare the trade-offs below, and when one fits, set it as your campaign draft.',
      attachment: 'plan-variants',
    }
  }

  if (/goal|stand|status|progress|where (are|do) (we|things|my)/.test(text)) {
    return { content: goalsStatusReply(campaign) }
  }

  if (/focus|next step|what next|what should|priorit|start with/.test(text)) {
    return { content: nextFocusReply(campaign) }
  }

  if (/knowledge|file|index|upload|document|source|cite/.test(text)) {
    return { content: knowledgeReply(campaign) }
  }

  if (/objective|aim|purpose|why|win look/.test(text)) {
    return { content: objectiveReply(campaign) }
  }

  const fallback = FALLBACKS[fallbackIndex % FALLBACKS.length]!
  fallbackIndex += 1
  return { content: fallback(campaign) }
}
