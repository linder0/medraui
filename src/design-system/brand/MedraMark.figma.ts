/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=17-39
// source=src/design-system/brand/MedraMark.tsx
// component=MedraMark
import figma from 'figma'

// Renders in currentColor — tint with a text color class.
export default {
  example: figma.code`<MedraMark className="h-6 w-auto" />`,
  imports: ['import { MedraMark } from "@/design-system"'],
  id: 'medra-mark',
  metadata: { nestable: true },
}
