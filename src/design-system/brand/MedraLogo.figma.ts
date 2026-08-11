/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=18-28
// source=src/design-system/brand/MedraLogo.tsx
// component=MedraLogo
import figma from 'figma'

// Renders in currentColor — tint with a text color class.
export default {
  example: figma.code`<MedraLogo className="h-6 w-auto" />`,
  imports: ['import { MedraLogo } from "@/design-system"'],
  id: 'medra-logo',
  metadata: { nestable: true },
}
