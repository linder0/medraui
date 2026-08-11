/**
 * Navigation is pure data (labels + paths) so both server routes and
 * client components can import it. Icons are presentation — the Sidebar
 * maps them onto paths itself.
 */

/** Sidebar navigation is data — the Sidebar component just renders this. */
export const navSections = [
  {
    // The primary group renders without a section label.
    label: undefined,
    items: [
      { label: 'Dashboard', path: '/' },
      { label: 'Campaigns', path: '/campaigns' },
      { label: 'Examples', path: '/examples' },
      { label: 'Runs', path: '/runs' },
      { label: 'Iteration', path: '/iteration' },
    ],
  },
  {
    label: 'Lab Inventory',
    items: [
      { label: 'Locations', path: '/locations' },
      { label: 'Catalog', path: '/catalog' },
      { label: 'Inventory', path: '/inventory' },
      { label: 'Receiving', path: '/receiving' },
      { label: 'Orders', path: '/orders' },
      { label: 'Suppliers', path: '/suppliers' },
    ],
  },
  {
    label: 'Maintenance',
    items: [{ label: 'Tickets', path: '/tickets' }],
  },
] as const

export type NavSection = (typeof navSections)[number]
export type NavItem = NavSection['items'][number]
export type NavPath = NavItem['path']

/** Routes that are fully built out; everything else in the sidebar renders
 *  the shared placeholder scaffold via the top-level [section] route. */
const builtRoutes = new Set<string>(['/', '/campaigns', '/runs', '/iteration'])

/** Sidebar entries that are still stubs — drives the placeholder route. */
export function stubNavItems(): NavItem[] {
  const stubs: NavItem[] = []
  for (const section of navSections) {
    for (const item of section.items) {
      if (!builtRoutes.has(item.path)) stubs.push(item)
    }
  }
  return stubs
}

/** Campaign detail tabs, shared by the campaign panel and the
 *  /campaigns/[campaignId]/[section] route. */
export const campaignSections = [
  { segment: 'assays', label: 'Assays' },
  { segment: 'plan', label: 'Plan' },
  { segment: 'knowledge', label: 'Knowledge' },
  { segment: 'chats', label: 'Chats' },
] as const

export type CampaignSectionSegment = (typeof campaignSections)[number]['segment']
