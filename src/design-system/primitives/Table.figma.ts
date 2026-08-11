/// <reference types="@figma/code-connect/figma-types" />
// url=https://www.figma.com/design/Q24ZQHB62X7aaY7cfJCVTO/medra?node-id=16-19
// source=src/design-system/primitives/Table.tsx
// component=DataTable
import figma from 'figma'

// Columns and rows are data-driven in code; the Figma component is a static example.
export default {
  example: figma.code`<DataTable
  columns={columns}
  rows={rows}
  rowKey={(row) => row.id}
  emptyState={<EmptyState title="No rows yet" />}
/>`,
  imports: ['import { DataTable, EmptyState } from "@/design-system"'],
  id: 'data-table',
  metadata: { nestable: false },
}
