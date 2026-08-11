/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=14-23
// source=src/design-system/primitives/Card.tsx
// component=Card
import figma from 'figma'

const instance = figma.selectedInstance

const variant = instance.getEnum('Variant', {
  Raised: 'raised',
  Outlined: 'outlined',
  Sunken: 'sunken',
})
const title = instance.getString('Title')
const description = instance.getString('Description')

export default {
  example: figma.code`<Card variant="${variant}">
  <CardHeader title="${title}" description="${description}" />
</Card>`,
  imports: ['import { Card, CardHeader } from "@/design-system"'],
  id: 'card',
  metadata: { nestable: false },
}
