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

/* Brand */
export { MedraMark } from './brand/MedraMark'
export { MedraWordmark } from './brand/MedraWordmark'
export { MedraLogo } from './brand/MedraLogo'
