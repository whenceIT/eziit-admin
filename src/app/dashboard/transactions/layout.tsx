import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 1
      }}
    >
      <Container maxWidth="xl">
        {children}
      </Container>
    </Box>
  );
}