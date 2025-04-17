import PendingRequests from "./app/merchant-dashboard/allpendingrequests/pendingrequests/page";

export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    //merchant dashboard
    overview: '/dashboard',
    merchantOverview: '/merchant-dashboard',
    merchantTransactions: "/merchant-dashboard/transactions",
    merchantPendingRequests: {
      index: "/merchant-dashboard/allpendingrequests",
      pendingrequests: "/merchant-dashboard/allpendingrequests/pendingrequests"
    },
    merchantClients: { 
      index: "/merchant-dashboard/clients",
      myclients: "/merchant-dashboard/clients/myclients",
      allclients: "/merchant-dashboard/clients/allclients"
    },
    merchantEmployers: {
      index: "/merchant-dashboard/employers",
      mylinkedemployers: "/merchant-dashboard/employers/mylinkedemployers",
      allemployers: "/merchant-dashboard/employers/allemployers"
    },
    merchantUnderwriters: {
      index: "/merchant-dashboard/underwriters",
      mylinkedunderwriter: "/merchant-dashboard/underwriters/mylinkedunderwriter",
      allunderwriters: "/merchant-dashboard/underwriters/allunderwriters"
    },
    merchantStores: "/merchant-dashboard/stores",
    account: '/dashboard/account',
    merchantratingsandcomments: '/dashboard/ratingsandcomments',


    //admin dashboard
    clients: {
      index: "/dashboard/clients",
      merchants: "/dashboard/clients/linkedmerchants",
      employers: "/dashboard/clients/linkedemployers",
      notLinked: "/dashboard/clients/not-linked",
      linkedbyboth: "/dashboard/clients/linkedbyboth"
    },
    employers: '/dashboard/employers',
    merchants: {
    index: "/dashboard/merchants",
    viewmerchants: "/dashboard/merchants/viewmerchants",
    pendingunderwriterapproval: "/dashboard/merchants/pendingunderwriterapproval"
    },
    underwriters: '/dashboard/underwriters',
    stores: '/dashboard/stores',
    reports: {
      index: "/dashboard/reports",
      clientreports: "/dashboard/reports/client-reports",
      merchantreports: "/dashboard/reports/merchant-reports",
      underwriterreports: "/dashboard/reports/underwriter-reports",
      transactionreports: "/dashboard/reports/transaction-reports",
      employerreports: "/dashboard/reports/employer-reports"
    },
    statistics: '/dashboard/statistics',
    users: '/dashboard/users',
    ratingsandcomments: '/dashboard/ratingsandcomments',

    //employer dashboard
    employerOverview: '/employer-dashboard',
    employerTransactions: "/employer-dashboard/transactions",
    employerPendingRequests: {
      index: "/employer-dashboard/allpendingrequests",
      pendingrequests: "/employer-dashboard/allpendingrequests/pendingrequests"
    },
    employerEmployees: {
      index: "/employer-dashboard/employees",
      mylinkedemployees: "/employer-dashboard/employees/mylinkedemployees",
      allclients: "/employer-dashboard/employees/allclients"
    },
    employerMerchants: {
      index: "/employer-dashboard/merchants",
      mylinkedmerchants: "/employer-dashboard/merchants/mylinkedmerchants",
      allmerchants: "/employer-dashboard/merchants/allmerchants"
    },
    employerUnderwriters: {
      index: "/employer-dashboard/underwriters",
      mylinkedunderwriters: "/employer-dashboard/underwriters/mylinkedunderwriters",
      allunderwriters: "/employer-dashboard/underwriters/allunderwriters"
    },

    employeraccount: '/dashboard/account',
    employerratingsandcomments: '/dashboard/ratingsandcomments',
    

    //underwriter dashboard
    underwriterOverview: '/underwriter-dashboard',
    underwriterTransactions: "/underwriter-dashboard/transactions",
    underwriterPendingRequests: {
      index: "/underwriter-dashboard/allpendingrequests",
      pendingrequests: "/underwriter-dashboard/allpendingrequests/pendingrequests"
    },
    underwriterClients: {
      index: "/underwriter/clients",
      mylinkedclients: "/underwriter-dashboard/clients/mylinkedclients",
      allclients: "/underwriter-dashboard/clients/allclients"
    },
    underwriterEmployers: {
      index: "/underwriter-dashboard/employers", 
      mylinkedemployers: "/underwriter-dashboard/employers/mylinkedemployers",
      allemployers: "/underwriter-dashboard/employers/allemployers"
    },
    underwriterMerchants: {
      index: "/underwriter-dashboard/merchants", 
      mylinkedmerchants: "/underwriter-dashboard/merchants/mylinkedmerchants",
      allmerchants: "/underwriter-dashboard/merchants/allmerchants"
    },
    underwriteraccount: '/dashboard/account',
    underwriterratingsandcomments: '/dashboard/ratingsandcomments',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
