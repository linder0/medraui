/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=11-82
// source=src/design-system/primitives/Kicker.tsx
// component=Kicker
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const tone = instance.getEnum('Tone', {
  Default: 'default',
  Muted: 'muted',
  Inverse: 'inverse',
})

const showIcon = instance.getBoolean('Show Icon')
const icon = showIcon ? instance.getInstanceSwap('Icon') : null
let iconCode
if (icon && icon.type === 'INSTANCE') {
  iconCode = icon.executeTemplate().example
}

export default {
  example: figma.code`<Kicker tone="${tone}"${iconCode ? figma.code` icon={${iconCode}}` : ''}>${label}</Kicker>`,
  imports: ['import { Kicker } from "@/design-system"'],
  id: 'kicker',
  metadata: { nestable: true },
}
