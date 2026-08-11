/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=11-126
// source=src/design-system/primitives/Progress.tsx
// component=Progress
import figma from 'figma'

const instance = figma.selectedInstance

const tone = instance.getEnum('Tone', {
  Default: 'default',
  Success: 'success',
  Accent: 'accent',
})

export default {
  example: figma.code`<Progress value={60} tone="${tone}" />`,
  imports: ['import { Progress } from "@/design-system"'],
  id: 'progress',
  metadata: { nestable: true },
}
