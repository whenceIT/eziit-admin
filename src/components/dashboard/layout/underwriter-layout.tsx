'use client';
//here
import * as React from 'react';
import Box from '@mui/material/Box';
import { SideNav } from './side-nav';
import { MainNav } from './main-nav';

interface UnderwriterLayoutProps {
  children: React.ReactNode;
}

export function UnderwriterLayout({ children }: UnderwriterLayoutProps): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav userType="underwriter" />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <MainNav userType="underwriter" />
        <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

