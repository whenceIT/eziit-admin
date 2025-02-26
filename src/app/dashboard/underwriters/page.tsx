"use client"

import * as React from 'react';
//import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { config } from '@/config';
import { UnderwritersFilters } from '@/components/dashboard/underwriter/underwriters-filters';
import { UnderwritersTable } from '@/components/dashboard/underwriter/underwriters-table';
import type { Underwriter } from '@/components/dashboard/underwriter/underwriters-table';

//export const metadata = { title: `Underwriters | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [underwriters, setUnderwriters] = React.useState<Underwriter[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);

  React.useEffect(() => {
    fetch('https://ezitt.whencefinancesystem.com/underwriters')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch underwriters');
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Underwriters:", data);
        setUnderwriters(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching underwriters:", err.message);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const paginatedUnderwriters = applyPagination(underwriters, page, rowsPerPage);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Underwriters</Typography>
        </Stack>
      </Stack>
      <UnderwritersFilters />
      <UnderwritersTable
        count={underwriters.length}
        page={page}
        rows={paginatedUnderwriters}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(rows: Underwriter[], page: number, rowsPerPage: number): Underwriter[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
