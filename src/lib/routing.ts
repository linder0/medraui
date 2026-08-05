/**
 * Whether `href` should read as the active nav target for `pathname`.
 * Non-exact matches include descendant routes (`/campaigns` is active on
 * `/campaigns/abc`); `exact` restricts to the route itself (overview tabs).
 * The root path always matches exactly so it doesn't light up everywhere.
 */
export function isPathActive(
  pathname: string,
  href: string,
  { exact = false }: { exact?: boolean } = {},
): boolean {
  if (exact || href === '/') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
