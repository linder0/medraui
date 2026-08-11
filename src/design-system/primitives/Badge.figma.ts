/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=11-66
// source=src/design-system/primitives/Badge.tsx
// component=Badge
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const tone = instance.getEnum('Tone', {
  Neutral: 'neutral',
  Success: 'success',
  Warning: 'warning',
  Danger: 'danger',
  Info: 'info',
  Accent: 'accent',
})
const variant = instance.getEnum('Variant', {
  Soft: 'soft',
  Outline: 'outline',
})

const showIcon = instance.getBoolean('Show Icon')
const icon = showIcon ? instance.getInstanceSwap('Icon') : null
let iconCode
if (icon && icon.type === 'INSTANCE') {
  iconCode = icon.executeTemplate().example
}

export default {
  example: figma.code`<Badge tone="${tone}" variant="${variant}"${iconCode ? figma.code` icon={${iconCode}}` : ''}>${label}</Badge>`,
  imports: ['import { Badge } from "@/design-system"'],
  id: 'badge',
  metadata: { nestable: true },
}
