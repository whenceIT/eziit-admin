import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const adminNavItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.clients.index, icon: 'users', 
    items: [{ key: "merchants", title: "Linked Merchants", href: paths.dashboard.clients.merchants, },
            { key: "employers", title: "Linked Employers", href: paths.dashboard.clients.employers, },
            { key: "notLinked", title: "UnLinked", href: paths.dashboard.clients.notLinked, },
            { key: "linkedbyboth", title: "Linked by Both", href: paths.dashboard.clients.linkedbyboth, }, ]},
  { key: 'employers', title: 'Employers', href: paths.dashboard.employers, icon: 'employers' },
  { key: 'merchants', title: 'Merchants', href: paths.dashboard.merchants.index, icon: 'users',
    items: [{ key: "viewmerchants", title: "View Merchants", href: paths.dashboard.merchants.viewmerchants, }, 
            { key: "underwriterspendingapproval", title: "Pending Underwriter Approval", href: paths.dashboard.merchants.pendingunderwriterapproval, },
            
    ]},
  { key: 'underwriters', title: 'Underwriters', href: paths.dashboard.underwriters, icon: 'employers'},
  { key: 'stores', title: 'Stores', href: paths.dashboard.stores, icon: 'stores' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'reports', title: 'Reports', href: paths.dashboard.reports.index, icon: 'reports', 
    items: [{ key: "clientreports", title: "Client Reports", href: paths.dashboard.reports.clientreports, },
            { key: "merchantreports", title: "Merchant Reports", href: paths.dashboard.reports.merchantreports, },
            { key: "underwriterreports", title: "Underwriter Reports", href: paths.dashboard.reports.underwriterreports, },
            { key: "transactionreports", title: "Transaction Reports", href: paths.dashboard.reports.transactionreports, },
            { key: "employerreports", title: "Employer Reports", href: paths.dashboard.reports.employerreports, }, ]},
  { key: 'statistics', title: 'Statistics', href: paths.dashboard.statistics, icon: 'chart-pie' },
];

export const merchantNavItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.merchantOverview, icon: 'chart-pie' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.merchantClients, icon: 'users' },
  { key: 'employers', title: 'Employers', href: paths.dashboard.merchantEmployers, icon: 'employers' },
  { key: 'stores', title: 'Stores', href: paths.dashboard.merchantStores, icon: 'stores' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  //{ key: 'statistics', title: 'Statistics', href: paths.dashboard.merchantStatistics, icon: 'chart-pie' },
];


export const navItems = adminNavItems;

