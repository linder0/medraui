import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Play,
  Plus,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Chromatogram,
  CurveFit,
  EmptyState,
  FitParamsCard,
  InteractionMatrix,
  Kicker,
  PlateMap,
  QCPanel,
  Sensorgram,
  Timecourse,
  type BadgeTone,
} from '@/design-system'
import { GoalAssayTracker } from '@/components/campaign/GoalAssayTracker'
import {
  binningExample,
  doseResponseExample,
  lcmsExample,
  plateScreenExample,
  sprExample,
  stabilityExample,
} from '@/data/assayExamples'
import type { Assay, AssayStatus, Campaign, CampaignGoal } from '@/data/types'

const assayStatusTone: Record<AssayStatus, BadgeTone> = {
  draft: 'neutral',
  ready: 'info',
  running: 'warning',
  completed: 'success',
}

/**
 * Latest readout per assay, keyed by assay id from campaigns.ts and composed
 * from the assay primitive library. Assays without an entry (or without runs)
 * render the no-runs placeholder instead.
 */
const assayReadouts: Record<string, () => ReactNode> = {
  'assay-kras-primary': () => (
    <>
      <QCPanel metrics={[...plateScreenExample.qc]} />
      <div className="mt-4">
        <PlateMap
          values={plateScreenExample.values.map((row) => [...row])}
          valueLabel="% inhibition"
          domain={[0, 100]}
          controlCols={{ positive: [0], negative: [11] }}
          hitThreshold={80}
        />
      </div>
    </>
  ),
  'assay-kras-dr': () => (
    <>
      <QCPanel metrics={[...doseResponseExample.qc]} />
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <CurveFit
          series={[...doseResponseExample.series]}
          xLabel="Compound (nM)"
          yLabel="% inhibition"
          crossings={[{ y: 50, label: 'IC50 crossing' }]}
        />
        <FitParamsCard
          title="4PL fit · KRAS G12C titration"
          params={[...doseResponseExample.params]}
          meta="R² 0.998 · 10 doses · 3 replicates · plate 2 of 4"
        />
      </div>
    </>
  ),
  'assay-her2-plasma': () => (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Timecourse
        series={[...stabilityExample.series]}
        xLabel="Incubation (h) · human plasma, 37 °C"
        yLabel="% intact conjugate"
        thresholds={[{ y: 50, label: 't½' }]}
      />
      <FitParamsCard
        title="Decay fit · HER2 ADC linkers"
        params={[...stabilityExample.params]}
        meta="6 timepoints · duplicate incubations · LC-MS readout"
      />
    </div>
  ),
  'assay-her2-lcms': () => (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Chromatogram
        trace={[...lcmsExample.trace]}
        peaks={[...lcmsExample.peaks]}
        yLabel="TIC (10³ counts)"
      />
      <FitParamsCard
        title="Peak integration · payload release"
        params={[...lcmsExample.params]}
        meta="48 h plasma timepoint · C18 gradient · vs reference standard"
      />
    </div>
  ),
  'assay-egfr-spr': () => (
    <>
      <QCPanel metrics={[...sprExample.qc]} />
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Sensorgram traces={[...sprExample.traces]} phases={[...sprExample.phases]} />
        <FitParamsCard
          title="1:1 Langmuir fit · EGFR mAb-04"
          params={[...sprExample.params]}
          meta="Three-point titration · reference-subtracted · flow cell 2"
        />
      </div>
    </>
  ),
  'assay-egfr-binning': () => (
    <>
      <InteractionMatrix
        labels={[...binningExample.labels]}
        values={binningExample.values.map((row) => [...row])}
        threshold={0.5}
        interactionLabel="Competes (same bin)"
        noInteractionLabel="Sandwich-compatible"
        axisRoles={['immobilized', 'detecting']}
      />
      <p className="mt-3 text-sm text-secondary">Result: {binningExample.bins}</p>
    </>
  ),
}

function AssayCard({ assay, goal }: { assay: Assay; goal: CampaignGoal }) {
  const hasRuns = assay.runCount > 0
  const readout = hasRuns ? assayReadouts[assay.id] : undefined

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-edge bg-sunken text-secondary">
            <FlaskConical className="size-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-primary">
                {assay.name}
              </h3>
              <Badge tone={assayStatusTone[assay.status]}>{assay.status}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-tertiary">
              <span className="font-mono font-semibold tracking-wide uppercase">
                {goal.code}
              </span>{' '}
              {goal.title} · {assay.versions} version
              {assay.versions === 1 ? '' : 's'} · {assay.runCount} run
              {assay.runCount === 1 ? '' : 's'} · {assay.experimentId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {assay.status === 'ready' && (
            <Button
              size="sm"
              variant="primary"
              leadingIcon={<Play className="size-3.5" strokeWidth={1.75} />}
            >
              Start run
            </Button>
          )}
          <Button
            size="sm"
            trailingIcon={<ArrowRight className="size-3.5" strokeWidth={1.75} />}
          >
            Open
          </Button>
        </div>
      </div>

      <div className="mt-5">
        {readout ? (
          <>
            <Kicker>
              {assay.status === 'running' ? 'Latest readout · in progress' : 'Latest readout'}
            </Kicker>
            <div className="mt-3">{readout()}</div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-edge px-4 py-5 text-center">
            <p className="text-sm font-medium text-secondary">No runs yet</p>
            <p className="mt-1 text-xs text-tertiary">
              Readouts appear here after the first run of this assay completes.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export function CampaignAssays({ campaign }: { campaign: Campaign }) {
  const goalsWithAssays = campaign.goals.filter((goal) => goal.assays.length > 0)
  const assayTotal = goalsWithAssays.reduce(
    (sum, goal) => sum + goal.assays.length,
    0,
  )

  return (
    <>
      <header>
        <Link
          href={`/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to overview
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">
              Assays
            </h1>
            <p className="mt-1 text-sm text-secondary">{campaign.name}</p>
          </div>

          <Button
            variant="primary"
            leadingIcon={<Plus className="size-4" strokeWidth={1.75} />}
          >
            New assay
          </Button>
        </div>

        <div className="mt-4">
          <GoalAssayTracker goals={campaign.goals} />
        </div>
      </header>

      {assayTotal === 0 ? (
        <EmptyState
          icon={<FlaskConical className="size-6" strokeWidth={1.5} />}
          title="No assays yet"
          description={`Assays for ${campaign.name} will appear here once created.`}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {goalsWithAssays.flatMap((goal) =>
            goal.assays.map((assay) => (
              <AssayCard key={assay.id} assay={assay} goal={goal} />
            )),
          )}
        </div>
      )}
    </>
  )
}
