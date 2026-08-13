import {
  ArrowUp,
  Download,
  FolderPlus,
  RefreshCw,
  Search,
  Upload,
  MoreHorizontal,
  FileText,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  IconButton,
  Input,
  Kicker,
  type Column,
} from '@/design-system'
import type { CampaignFile } from '@/data/types'

const columns: Column<CampaignFile>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (file) => (
      <span className="flex items-center gap-2 font-medium">
        <FileText className="size-4 text-tertiary" strokeWidth={1.75} />
        {file.name}
      </span>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    widthClassName: 'w-20',
    render: (file) => <span className="text-secondary">{file.type}</span>,
  },
  {
    key: 'size',
    header: 'Size',
    widthClassName: 'w-24',
    render: (file) => <span className="text-secondary">{file.size}</span>,
  },
  {
    key: 'indexed',
    header: 'Indexed',
    widthClassName: 'w-28',
    render: (file) =>
      file.indexed ? (
        <Badge tone="success">Indexed</Badge>
      ) : (
        <Badge tone="neutral">Pending</Badge>
      ),
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    widthClassName: 'w-20',
    render: () => (
      <IconButton
        label="File actions"
        size="sm"
        icon={<MoreHorizontal className="size-4" strokeWidth={1.75} />}
      />
    ),
  },
]

export function FileBrowser({ files }: { files: CampaignFile[] }) {
  return (
    <Card padding="lg">
      <CardHeader
        title="Campaign files"
        description="Attach SOPs, PDFs, CSVs, JSON, Markdown, or notes as context for the AI Experimentalist."
      />

      <Kicker className="mt-5">Knowledge base</Kicker>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <IconButton
          label="Up one level"
          variant="secondary"
          icon={<ArrowUp className="size-4" strokeWidth={1.75} />}
        />
        <Input
          leadingIcon={<Search className="size-4" strokeWidth={1.75} />}
          placeholder="Search files..."
          className="min-w-40 flex-1 rounded-lg"
        />
        <Button leadingIcon={<FolderPlus className="size-4" strokeWidth={1.75} />}>
          New folder
        </Button>
        <Button leadingIcon={<Upload className="size-4" strokeWidth={1.75} />}>
          Upload
        </Button>
        <Button leadingIcon={<Download className="size-4" strokeWidth={1.75} />}>
          Download all
        </Button>
        <IconButton
          label="Refresh files"
          variant="secondary"
          icon={<RefreshCw className="size-4" strokeWidth={1.75} />}
        />
      </div>

      <DataTable
        className="mt-4"
        columns={columns}
        rows={files}
        rowKey={(file) => file.id}
        emptyState={
          <EmptyState
            className="mt-4"
            icon={<FileText className="size-6" strokeWidth={1.5} />}
            title="No files yet"
            description="Upload documents to give the AI Experimentalist context for this campaign."
          />
        }
      />
    </Card>
  )
}
