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
  { key: 'users', title: 'Users', href: paths.dashboard.users, icon: 'user' },
  { key: 'ratingsandcomments', title: 'Ratings and Comments', href: paths.dashboard.ratingsandcomments, icon: 'user' },
  
];
export const navItems = adminNavItems;


//merchant dashboard
export const merchantNavItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.merchantOverview, icon: 'chart-pie' },
  { key: 'allpendingrequests', title: 'Requests to Link', href: paths.dashboard.merchantPendingRequests.index, icon: 'chart-pie',
    items: [{ key: "pendingrequests", title: "All Pending Requests", href: paths.dashboard.merchantPendingRequests.pendingrequests, },
    ]},
  { key: 'clients', title: 'Clients', href: paths.dashboard.merchantClients.index, icon: 'users',
    items: [{ key: "myclients", title: "My Clients", href: paths.dashboard.merchantClients.myclients, },
            { key: "allclients", title: "All Clients", href: paths.dashboard.merchantClients.allclients, },
     ]},

  { key: 'employers', title: 'Employers', href: paths.dashboard.merchantEmployers.index, icon: 'employers',
    items: [{ key: "mylinkedemployers", title: "My Linked Employers", href: paths.dashboard.merchantEmployers.mylinkedemployers, },
      { key: "allemployers", title: "All Employers", href: paths.dashboard.merchantEmployers.allemployers, },
    ]},
  { key: 'underwriters', title: 'Underwriters', href: paths.dashboard.merchantUnderwriters.index, icon: 'employers',
    items: [{ key: "mylinkedunderwriter", title: "My Linked Underwriters", href: paths.dashboard.merchantUnderwriters.mylinkedunderwriter, },
      { key: "allunderwriters", title: "All Underwriters", href: paths.dashboard.merchantUnderwriters.allunderwriters, },
    ]},
  { key: 'stores', title: 'Stores', href: paths.dashboard.merchantStores, icon: 'stores' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'ratingsandcomments', title: 'Ratings and Comments', href: paths.dashboard.ratingsandcomments, icon: 'user' },

  //{ key: '', title: 'Statistics', href: paths.dashboard.merchantStatistics, icon: 'chart-pie' },
];

//employer dashboard
export const employerNavItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.employerOverview, icon: 'chart-pie' },
  { key: 'allpendingrequests', title: 'Requests to Link', href: paths.dashboard.employerPendingRequests.index, icon: 'chart-pie',
    items: [{ key: "pendingrequests", title: "All Pending Requests", href: paths.dashboard.employerPendingRequests.pendingrequests, },
    ]},
  { key: 'employees', title: 'My Employees', href: paths.dashboard.employerEmployees.index, icon: 'users',
    items: [{ key: "mylinkedemployees", title: "My Employees", href: paths.dashboard.employerEmployees.mylinkedemployees, },
            { key: "all clients", title: "All Clients", href: paths.dashboard.employerEmployees.allclients, },
     ]},
  { key: 'merchants', title: 'Merchants', href: paths.dashboard.employerMerchants.index, icon: 'employers',
    items: [{ key: "mylinkedmerchants", title: "My Linked Merchants", href: paths.dashboard.employerMerchants.mylinkedmerchants, },
            { key: "allmerchants", title: "All Merchants", href: paths.dashboard.employerMerchants.allmerchants, },
     ]},
  { key: 'underwriters', title: 'Underwriters', href: paths.dashboard.employerUnderwriters.index, icon: 'employers',
    items: [{ key: "mylinkedunderwriters", title: "My Linked Underwriters", href: paths.dashboard.employerUnderwriters.mylinkedunderwriters, },
            { key: "allunderwriters", title: "All Underwriters", href: paths.dashboard.employerUnderwriters.allunderwriters, },
     ]},
  
  { key: 'transactions', title: 'Transactions', href: paths.dashboard.employerTransactions, icon: 'chart-pie' },
  { key: 'employeraccount', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'ratingsandcomments', title: 'Ratings and Comments', href: paths.dashboard.ratingsandcomments, icon: 'user' },
  //{ key: 'statistics', title: 'Statistics', href: paths.dashboard.employerStatistics, icon: 'chart-pie' },
];

//underwriter dashboard
export const underwriterNavItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.underwriterOverview, icon: 'chart-pie' },
  { key: 'allpendingrequests', title: 'Requests to Link', href: paths.dashboard.underwriterPendingRequests.index, icon: 'chart-pie',
    items: [{ key: "pendingrequests", title: "All Pending Requests", href: paths.dashboard.underwriterPendingRequests.pendingrequests, },
    ]},
  { key: 'clients', title: 'Clients', href: paths.dashboard.underwriterClients.index, icon: 'employers',
    items: [{ key: "mylinkedclients", title: "My Linked Clients", href: paths.dashboard.underwriterClients.mylinkedclients, },
            { key: "allclients", title: "All Clients", href: paths.dashboard.underwriterClients.allclients, },
     ]},
  {key: 'employers', title: 'Employers', href: paths.dashboard.underwriterEmployers.index, icon: 'employers',
    items: [{ key: "mylinkedemployers", title: "My Linked Employers", href: paths.dashboard.underwriterEmployers.mylinkedemployers, },
            { key: "allemployers", title: "All Employers", href: paths.dashboard.underwriterEmployers.allemployers, },
    ]},
  { key: 'merchants', title: 'Merchants', href: paths.dashboard.underwriterMerchants.index, icon: 'employers',
    items: [{ key: "mylinkedmerchants", title: "My Linked Merchants", href: paths.dashboard.underwriterMerchants.mylinkedmerchants, },
            { key: "allmerchants", title: "All Merchants", href: paths.dashboard.underwriterMerchants.allmerchants, },
     ]},
  
  //{ key: 'stores', title: 'Stores', href: paths.dashboard.underwriterStores, icon: 'stores'},
  { key: 'transactions', title: 'Transactions', href: paths.dashboard.underwriterTransactions, icon: 'chart-pie' },
  { key: 'underwriteraccount', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  { key: 'ratingsandcomments', title: 'Ratings and Comments', href: paths.dashboard.ratingsandcomments, icon: 'user' },
  //{ key: 'statistics', title: 'Statistics', href: paths.dashboard.underwriterStatistics, icon: 'chart-pie' },
];
