/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=11-119
// source=src/design-system/primitives/Avatar.tsx
// component=Avatar
import figma from 'figma'

const instance = figma.selectedInstance

// Code derives initials from `name`; the Figma property holds the initials directly.
const initials = instance.getString('Initials')
const size = instance.getEnum('Size', {
  Small: 'sm',
  Medium: 'md',
  Large: 'lg',
})
const tone = instance.getEnum('Tone', {
  Inverse: 'inverse',
  Accent: 'accent',
  Neutral: 'neutral',
})
const shape = instance.getEnum('Shape', {
  Square: 'square',
  Circle: 'circle',
})

export default {
  example: figma.code`<Avatar name="${initials}" size="${size}" tone="${tone}" shape="${shape}" />`,
  imports: ['import { Avatar } from "@/design-system"'],
  id: 'avatar',
  metadata: { nestable: true },
}
