// client/page.tsx
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import Head from 'next/head';

import { config } from '@/config';
import { ClientsFilters } from '@/components/dashboard/client/clients-filters';
import { ClientsTable } from '@/components/dashboard/client/clients-table';
import type { Client } from '@/components/dashboard/client/clients-table';

export default function Page(): React.JSX.Element {
  const [clients, setClients] = useState<Client[]>([]);
  const page = 0;
  const rowsPerPage = 15;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('https://ezitt.whencefinancesystem.com/clients');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Map the data to match your component's expectations
        const transformedData = data.map((client: any) => ({
          id: client.id ?? 0,
          user_id: client.user_id ?? 'N/A',
          name: `${client.first_name ?? ''} ${client.last_name ?? ''}`,
          float: client.float ?? 0,
          merchants: client.merchants ?? 'N/A',
          transactions: client.transactions ?? 'N/A',
          employer: client.employer ?? 'N/A',
          ratings: client.ratings ?? 0,
          comments: client.comments ?? ''
        }));

        setClients(transformedData);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const paginatedClients = applyPagination(clients, page, rowsPerPage);

  return (
    <>
      <Head>
        <title>{`Clients | Dashboard | ${config.site.name}`}</title>
      </Head>

      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Clients</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
                Import
              </Button>
              <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
                Export
              </Button>
            </Stack>
          </Stack>
        </Stack>
        <ClientsFilters />
        <ClientsTable
          count={paginatedClients.length}
          page={page}
          rows={paginatedClients}
          rowsPerPage={rowsPerPage}
        />
      </Stack>
    </>
  );
}

function applyPagination(rows: Client[], page: number, rowsPerPage: number): Client[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
