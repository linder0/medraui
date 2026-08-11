/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=13-24
// source=src/design-system/primitives/Input.tsx
// component=Input
import figma from 'figma'

const instance = figma.selectedInstance

// The Figma State variant (Default/Focus) is interaction-only — no code prop.
const placeholder = instance.getString('Placeholder')

const showIcon = instance.getBoolean('Show Leading Icon')
const icon = showIcon ? instance.getInstanceSwap('Leading Icon') : null
let iconCode
if (icon && icon.type === 'INSTANCE') {
  iconCode = icon.executeTemplate().example
}

export default {
  example: figma.code`<Input placeholder="${placeholder}"${iconCode ? figma.code` leadingIcon={${iconCode}}` : ''} />`,
  imports: ['import { Input } from "@/design-system"'],
  id: 'input',
  metadata: { nestable: true },
}
