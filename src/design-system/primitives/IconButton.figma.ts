/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=12-123
// source=src/design-system/primitives/IconButton.tsx
// component=IconButton
import figma from 'figma'

const instance = figma.selectedInstance

const variant = instance.getEnum('Style', {
  Secondary: 'secondary',
  Ghost: 'ghost',
  'Inverse Ghost': 'inverse-ghost',
})
const size = instance.getEnum('Size', {
  Small: 'sm',
  Medium: 'md',
})

const icon = instance.getInstanceSwap('Icon')
let iconCode
if (icon && icon.type === 'INSTANCE') {
  iconCode = icon.executeTemplate().example
}

export default {
  example: figma.code`<IconButton label="Action" variant="${variant}" size="${size}"${iconCode ? figma.code` icon={${iconCode}}` : ''} />`,
  imports: ['import { IconButton } from "@/design-system"'],
  id: 'icon-button',
  metadata: { nestable: true },
}
