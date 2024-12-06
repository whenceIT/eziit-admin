export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    clients: '/dashboard/clients',
    employers: '/dashboard/employers',
    merchants: '/dashboard/merchants',
    underwriters: '/dashboard/underwriters',
    stores: '/dashboard/stores',
    statistics: '/dashboard/statistics',
    //integrations: '/dashboard/integrations',
    //settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
