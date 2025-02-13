'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { SideNav } from './side-nav';
import { MainNav } from './main-nav';

interface MerchantLayoutProps {
  children: React.ReactNode;
}

export function MerchantLayout({ children }: MerchantLayoutProps): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav userType="merchant" />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <MainNav userType="merchant" />
        <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

