/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=34-114
// source=src/design-system/primitives/Modal.tsx
// component=Modal
import figma from 'figma'

const instance = figma.selectedInstance

const title = instance.getString('Title')
const body = instance.getString('Body')
const size = instance.getEnum('Size', {
  Small: 'sm',
  Medium: 'md',
  Large: 'lg',
})

export default {
  example: figma.code`<Modal open onClose={() => {}} size="${size}" label="${title}">
  <div className="p-6">
    <h2 className="text-xl font-semibold tracking-tight text-primary">${title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-secondary">${body}</p>
  </div>
</Modal>`,
  imports: ['import { Modal } from "@/design-system"'],
  id: 'modal',
  metadata: { nestable: false },
}
