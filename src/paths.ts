export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    merchantOverview: '/merchant-dashboard',
    merchantTransactions: "/merchant-dashboard/transactions",
    merchantClients: "/merchant-dashboard/clients",
    merchantEmployers: "/merchant-dashboard/employers",
    merchantUnderwriters: "/merchant-dashboard/underwriters",
    //merchantStores: "/merchant-dashboard/stores",
    account: '/dashboard/account',
    clients: {
      index: "/dashboard/clients",
      merchants: "/dashboard/clients/linkedmerchants",
      employers: "/dashboard/clients/linkedemployers",
      notLinked: "/dashboard/clients/not-linked",
      linkedbyboth: "/dashboard/clients/linkedbyboth"
    },//'/dashboard/clients',
    employers: '/dashboard/employers',
    merchants: '/dashboard/merchants',
    underwriters: '/dashboard/underwriters',
    stores: '/dashboard/stores',
    reports: {
      index: "/dashboard/reports",
      clientreports: "/dashboard/reports/client-reports",
      merchantreports: "/dashboard/reports/merchant-reports",
      underwriterreports: "/dashboard/reports/underwriter-reports",
      transactionreports: "/dashboard/reports/transaction-reports",
      organizationreports: "/dashboard/reports/organization-reports"
    },
    statistics: '/dashboard/statistics',
    //integrations: '/dashboard/integrations',
    //settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
