/**
 * Medra Design System — public API.
 * Import primitives from '@/design-system' only; never deep-import.
 */
export { Button, type ButtonProps } from './primitives/Button'
export { IconButton, type IconButtonProps } from './primitives/IconButton'
export { Badge, type BadgeProps, type BadgeTone } from './primitives/Badge'
export { Card, CardHeader, type CardProps } from './primitives/Card'
export { Kicker, type KickerProps } from './primitives/Kicker'
export { Input, type InputProps } from './primitives/Input'
export { Avatar, initialsOf, type AvatarProps } from './primitives/Avatar'
export { Progress, type ProgressProps } from './primitives/Progress'
export { DataTable, type Column, type DataTableProps } from './primitives/Table'
export { EmptyState, type EmptyStateProps } from './primitives/EmptyState'
export { Modal, type ModalProps } from './primitives/Modal'

/* Assay visualization primitives — the "shadcn for AI scientists" layer.
 * Pure and prop-driven: no data fetching, every readout doubles as a
 * machine-readable summary for the AI Experimentalist. */
export { PlateMap, type PlateMapProps } from './assay/PlateMap'
export {
  CurveFit,
  type CurveFitProps,
  type CurveFitSeries,
} from './assay/CurveFit'
export {
  Sensorgram,
  type SensorgramProps,
  type SensorgramTrace,
} from './assay/Sensorgram'
export {
  Timecourse,
  type TimecourseProps,
  type TimecourseSeries,
} from './assay/Timecourse'
export {
  Chromatogram,
  type ChromatogramProps,
  type ChromatogramPeak,
} from './assay/Chromatogram'
export {
  InteractionMatrix,
  type InteractionMatrixProps,
} from './assay/InteractionMatrix'
export {
  QCPanel,
  type QCPanelProps,
  type QCMetric,
  type QCStatus,
} from './assay/QCPanel'
export {
  FitParamsCard,
  type FitParamsCardProps,
  type FitParam,
} from './assay/FitParamsCard'
export type { XYPoint } from './assay/internal/XYChart'

/* Brand */
export { MedraMark } from './brand/MedraMark'
export { MedraWordmark } from './brand/MedraWordmark'
export { MedraLogo } from './brand/MedraLogo'
