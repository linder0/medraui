/**
 * Cookie persisting the sidebar's collapsed state. Lives in its own
 * module because it's read on the server (AppShell) and written on the
 * client (Sidebar) — value exports can't cross the 'use client' boundary.
 */
export const SIDEBAR_COLLAPSED_COOKIE = 'sidebar-collapsed'
