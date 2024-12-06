import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        flexDirection: 'column',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0, justifyContent: 'center' }}>
            <DynamicLogo colorDark="light" colorLight="dark" height={100} width={122} />
          </Box>
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          background: 'radial-gradient(50% 50% at 50% 50%, #CBA328 0%, #5C5346 100%)',
          color: 'var(--mui-palette-common-white)', 
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            perspective: '1000px',
          }}
        >
          <Box
            sx={{
              animation: 'flip 5s linear infinite',
              transformStyle: 'preserve-3d',
              '@keyframes flip': {
                '0%': {
                  transform: 'rotateY(0deg)',
                },
                '100%': {
                  transform: 'rotateY(360deg)',
                },
              },
            }}
          >
            <DynamicLogo colorDark="light" colorLight="light" height={300} width={300} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}