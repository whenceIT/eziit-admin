import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';


export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.clients, icon: 'users' },
  { key: 'employers', title: 'Employers', href: paths.dashboard.employers, icon: 'users' },
  { key: 'merchants', title: 'Merchants', href: paths.dashboard.merchants, icon: 'users' },
  { key: 'underwriters', title: 'Underwriters', href: paths.dashboard.underwriters, icon: 'users' },
  { key: 'stores', title: 'Stores', href: paths.dashboard.stores, icon: 'users' },
  //{ key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  //{ key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'statistics', title: 'Statistics', href: paths.dashboard.statistics, icon: 'chart-pie' },
] satisfies NavItemConfig[];
