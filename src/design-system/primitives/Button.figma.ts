/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=12-98
// source=src/design-system/primitives/Button.tsx
// component=Button
import figma from 'figma'

const instance = figma.selectedInstance

const label = instance.getString('Label')
const variant = instance.getEnum('Style', {
  Primary: 'primary',
  Secondary: 'secondary',
  Ghost: 'ghost',
  Inverse: 'inverse',
})
const size = instance.getEnum('Size', {
  Small: 'sm',
  Medium: 'md',
  Large: 'lg',
})

const showLeading = instance.getBoolean('Show Leading Icon')
const leading = showLeading ? instance.getInstanceSwap('Leading Icon') : null
let leadingCode
if (leading && leading.type === 'INSTANCE') {
  leadingCode = leading.executeTemplate().example
}

const showTrailing = instance.getBoolean('Show Trailing Icon')
const trailing = showTrailing ? instance.getInstanceSwap('Trailing Icon') : null
let trailingCode
if (trailing && trailing.type === 'INSTANCE') {
  trailingCode = trailing.executeTemplate().example
}

export default {
  example: figma.code`<Button variant="${variant}" size="${size}"${leadingCode ? figma.code` leadingIcon={${leadingCode}}` : ''}${trailingCode ? figma.code` trailingIcon={${trailingCode}}` : ''}>${label}</Button>`,
  imports: ['import { Button } from "@/design-system"'],
  id: 'button',
  metadata: { nestable: true },
}
