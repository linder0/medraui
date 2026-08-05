import { notFound } from 'next/navigation'
import { stubNavItems } from '@/data/navigation'
import { PlaceholderPage } from '@/views/PlaceholderPage'

/**
 * One route serves every sidebar section that isn't built yet
 * (Examples, Runs, Locations, ...). The set is derived from the
 * navigation data, so adding a sidebar entry automatically gives
 * it a placeholder page. Anything else 404s.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const item = stubNavItems().find((i) => i.path === `/${section}`)
  if (!item) notFound()

  return <PlaceholderPage title={item.label} />
}

export function generateStaticParams() {
  return stubNavItems().map((item) => ({ section: item.path.slice(1) }))
}
