/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=18-27
// source=src/design-system/brand/MedraWordmark.tsx
// component=MedraWordmark
import figma from 'figma'

// Renders in currentColor — tint with a text color class.
export default {
  example: figma.code`<MedraWordmark className="h-5 w-auto" />`,
  imports: ['import { MedraWordmark } from "@/design-system"'],
  id: 'medra-wordmark',
  metadata: { nestable: true },
}
