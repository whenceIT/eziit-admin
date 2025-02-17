import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const adminNavItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.clients.index, icon: 'users', 
    items: [{ key: "merchants", title: "Linked Merchants", href: paths.dashboard.clients.merchants, },
            { key: "employers", title: "Linked Employers", href: paths.dashboard.clients.employers, },
            { key: "notLinked", title: "UnLinked", href: paths.dashboard.clients.notLinked, },
            { key: "linkedbyboth", title: "Linked by Both", href: paths.dashboard.clients.linkedbyboth, }, ]},
  { key: 'employers', title: 'Employers', href: paths.dashboard.employers, icon: 'users' },
  { key: 'merchants', title: 'Merchants', href: paths.dashboard.merchants, icon: 'users' },
  { key: 'underwriters', title: 'Underwriters', href: paths.dashboard.underwriters, icon: 'users' },
  { key: 'stores', title: 'Stores', href: paths.dashboard.stores, icon: 'users' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'reports', title: 'Reports', href: paths.dashboard.reports.index, icon: 'chart-pie', 
    items: [{ key: "clientreports", title: "Client Reports", href: paths.dashboard.reports.clientreports, },
            { key: "merchantreports", title: "Merchant Reports", href: paths.dashboard.reports.merchantreports, },
            { key: "underwriterreports", title: "Underwriter Reports", href: paths.dashboard.reports.underwriterreports, },
            { key: "transactionreports", title: "Transaction Reports", href: paths.dashboard.reports.transactionreports, },
            { key: "organizationreports", title: "Organization Reports", href: paths.dashboard.reports.organizationreports, }, ]},
  { key: 'statistics', title: 'Statistics', href: paths.dashboard.statistics, icon: 'chart-pie' },
];

export const merchantNavItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.merchantOverview, icon: 'chart-pie' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.merchantClients, icon: 'users' },
  { key: 'employers', title: 'Employers', href: paths.dashboard.merchantEmployers, icon: 'users' },
  { key: 'stores', title: 'Stores', href: paths.dashboard.stores, icon: 'users' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  //{ key: 'statistics', title: 'Statistics', href: paths.dashboard.merchantStatistics, icon: 'chart-pie' },
];

// Keep the original navItems for backwards compatibility if needed
export const navItems = adminNavItems;

