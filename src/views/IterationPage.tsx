import { Badge, Card, CardHeader, Kicker } from '@/design-system'
import {
  Chromatogram,
  CurveFit,
  FitParamsCard,
  InteractionMatrix,
  PlateMap,
  QCPanel,
  Sensorgram,
  Timecourse,
} from '@/design-system'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  binningExample,
  doseResponseExample,
  failingQCExample,
  lcmsExample,
  plateScreenExample,
  sprExample,
  stabilityExample,
} from '@/data/assayExamples'

function AssayPrimer({
  what,
  instrument,
  workflow,
}: {
  what: string
  instrument: string
  workflow: string
}) {
  const items = [
    { label: 'The assay', body: what },
    { label: 'The instrument', body: instrument },
    { label: 'How it’s traditionally read', body: workflow },
  ]
  return (
    <dl className="mt-4 grid gap-x-6 gap-y-3 rounded-md border border-edge bg-panel p-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium tracking-wide text-tertiary uppercase">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm text-secondary">{item.body}</dd>
        </div>
      ))}
    </dl>
  )
}

function ComposedFrom({ primitives }: { primitives: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-tertiary">Composed from</span>
      {primitives.map((p) => (
        <Badge key={p} variant="outline" tone="accent">
          {p}
        </Badge>
      ))}
    </div>
  )
}

export function IterationPage() {
  return (
    <PageContainer>
      <div className="max-w-2xl">
        <Kicker>Design system · Iteration</Kicker>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">
          Assay Interface Library
        </h1>
        <p className="mt-3 text-md text-secondary">
          Composable visualization primitives for the assays Medra runs —
          binding kinetics, screens, binning, stability, and analytics. Each
          primitive is pure and prop-driven, and every readout pairs a visual
          for the scientist with a machine-readable summary the AI
          Experimentalist can cite and act on.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader
            title="Dose–response"
            description="Measured points with the fitted 4PL model on a log-dose axis. The same primitive serves potency, viability, and selectivity — only the axis labels change."
          />
          <AssayPrimer
            what="A compound is titrated across ~10 doses in a microplate against the target; a fluorescent or luminescent signal in each well reports how much activity remains at that dose."
            instrument="A benchtop microplate reader (Tecan Spark, PerkinElmer EnVision) — a beige box that swallows a 384-well plate on a motorized tray and returns a grid of raw counts a minute later."
            workflow="Counts are exported to Excel or CSV, pasted into GraphPad Prism, and the sigmoid is judged by eye; IC50s get copied into slides by hand."
          />
          <div className="mt-4">
            <QCPanel metrics={[...doseResponseExample.qc]} />
          </div>
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
          <ComposedFrom primitives={['CurveFit', 'FitParamsCard', 'QCPanel']} />
        </Card>

        <Card>
          <CardHeader
            title="SPR kinetics"
            description="Time-resolved binding at an analyte concentration series, association and dissociation phases annotated. Fit quality is judged by eye — and quantified for the agent."
          />
          <AssayPrimer
            what="Surface plasmon resonance: the target is immobilized on a gold sensor chip and analyte flows over it. Binding changes the refractive index at the surface, reporting mass in real time — no labels."
            instrument="A Biacore (Cytiva) — a washing-machine-sized unit with a docked sensor chip, racks of sample vials, and microfluidics that inject each concentration in sequence."
            workflow="Vendor evaluation software overlays fits on the raw sensorgrams; scientists judge residuals by eye, then export kon/koff/KD tables to Excel for the project meeting."
          />
          <div className="mt-4">
            <QCPanel metrics={[...sprExample.qc]} />
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
            <Sensorgram
              traces={[...sprExample.traces]}
              phases={[...sprExample.phases]}
            />
            <FitParamsCard
              title="1:1 Langmuir fit · EGFR mAb-04"
              params={[...sprExample.params]}
              meta="Three-point titration · reference-subtracted · flow cell 2"
            />
          </div>
          <ComposedFrom primitives={['Sensorgram', 'FitParamsCard', 'QCPanel']} />
        </Card>

        <Card>
          <CardHeader
            title="Plate screening"
            description="The spatial first look at plate data — edge effects, dispenser streaks, and control failures jump out before any statistic is computed. Hover a well for its value."
          />
          <AssayPrimer
            what="A single-dose screen: hundreds of compounds, one per well, with positive and negative controls pinned to fixed columns so every plate carries its own calibration."
            instrument="A robotic line — liquid handlers with pipette heads dispensing nanoliters, plate hotels and carousels shuttling barcoded plates into reader stacks, often running overnight."
            workflow="Heatmaps in Genedata Screener or Spotfire (or conditional formatting in Excel); a scientist scans each plate for streaks and edge artifacts before believing any hit list."
          />
          <div className="mt-4">
            <QCPanel metrics={[...plateScreenExample.qc]} />
          </div>
          <div className="mt-4">
            <PlateMap
              values={[...plateScreenExample.values.map((row) => [...row])]}
              valueLabel="% inhibition"
              domain={[0, 100]}
              controlCols={{ positive: [0], negative: [11] }}
              hitThreshold={80}
            />
          </div>
          <ComposedFrom primitives={['PlateMap', 'QCPanel']} />
        </Card>

        <Card>
          <CardHeader
            title="Epitope binning"
            description="Pairwise blocking matrix, classical sandwich format. Cluster-ordered labels make bins pop out as blocks along the diagonal — this run resolves three."
          />
          <AssayPrimer
            what="Pairwise competition between antibodies: if one blocks another from binding the antigen, they share an epitope and land in the same bin. Every pair is tested in both orientations."
            instrument="An Octet (BLI) with rows of disposable biosensor tips dipping into sample plates, or a Carterra LSA that arrays hundreds of antibodies on one SPR chip — runs go overnight."
            workflow="Vendor software renders a blocking heatmap and a network 'community' plot; the final bin assignment is often settled by manually reordering the matrix until the blocks look right."
          />
          <div className="mt-4">
            <InteractionMatrix
              labels={[...binningExample.labels]}
              values={binningExample.values.map((row) => [...row])}
              threshold={0.5}
              interactionLabel="Competes (same bin)"
              noInteractionLabel="Sandwich-compatible"
              axisRoles={['immobilized', 'detecting']}
            />
            <p className="mt-3 text-sm text-secondary">
              Result: {binningExample.bins}
            </p>
          </div>
          <ComposedFrom primitives={['InteractionMatrix', 'QCPanel']} />
        </Card>

        <Card>
          <CardHeader
            title="Stability timecourse"
            description="Percent-intact over incubation with the half-life crossing marked. Overlaying variants is the primary mode — stability runs exist to choose between candidates."
          />
          <AssayPrimer
            what="The conjugate is incubated in plasma at 37 °C and aliquots are pulled at scheduled timepoints; each aliquot is assayed for how much intact material remains."
            instrument="Less one machine than a schedule: a humidified incubator full of racked tubes, a lab timer, and the LC-MS downstream that quantifies each pulled timepoint."
            workflow="Timepoint tables accumulate in Excel across days, decay curves are fit in Prism, and half-lives are compared side by side to pick the winning candidate."
          />
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
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
          <ComposedFrom primitives={['Timecourse', 'FitParamsCard']} />
        </Card>

        <Card>
          <CardHeader
            title="LC-MS payload release"
            description="Signal vs retention time with integrated peaks annotated. Release reduces to a peak-area ratio, so the integration table always renders alongside the trace."
          />
          <AssayPrimer
            what="Liquid chromatography separates the sample's species as they elute off a column at different times; the mass spectrometer then identifies and quantifies each eluting peak."
            instrument="An HPLC stack — autosampler, pumps, column oven in a tower of modules — plumbed into a mass spec the size of an office copier, usually humming in its own room."
            workflow="Chromatograms open in vendor software (MassHunter, Xcalibur); an analyst drags integration bounds under each peak by hand, then exports the peak-area table."
          />
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem]">
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
          <ComposedFrom primitives={['Chromatogram', 'FitParamsCard']} />
        </Card>

        <Card>
          <CardHeader
            title="QC gates"
            description="Every assay view mounts a QC gate above its results — bad data must not look trustworthy. A failing gate flips the panel tone and should de-emphasize everything below it."
          />
          <div className="mt-4 space-y-3">
            <QCPanel metrics={[...plateScreenExample.qc]} />
            <QCPanel metrics={[...failingQCExample]} />
          </div>
          <ComposedFrom primitives={['QCPanel']} />
        </Card>
      </div>
    </PageContainer>
  )
}
