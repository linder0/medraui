/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=15-14
// source=src/design-system/primitives/EmptyState.tsx
// component=EmptyState
import figma from 'figma'

const instance = figma.selectedInstance

const title = instance.getString('Title')
const description = instance.getString('Description')

const showAction = instance.getBoolean('Show Action')
const action = showAction ? instance.findInstance('action') : null
let actionCode
if (action && action.type === 'INSTANCE') {
  actionCode = action.executeTemplate().example
}

export default {
  example: figma.code`<EmptyState title="${title}" description="${description}"${actionCode ? figma.code` action={${actionCode}}` : ''} />`,
  imports: ['import { EmptyState } from "@/design-system"'],
  id: 'empty-state',
  metadata: { nestable: false },
}
