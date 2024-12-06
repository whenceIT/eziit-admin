'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import Head from 'next/head';
import { config } from '@/config';
import { EmployersFilters } from '@/components/dashboard/employer/employers-filters';
import { EmployersTable } from '@/components/dashboard/employer/employers-table';
import type { Employer } from '@/components/dashboard/employer/employers-table';

export default function Page(): React.JSX.Element {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const page = 0;
  const rowsPerPage = 15;

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await fetch('https://ezitt.whencefinancesystem.com/employers');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const transformedData = data.map((employer: any) => ({
          id: employer.id ?? null,
          user_id: employer.user_id ?? null,
          employees: employer.employees ?? null,
          merchants: employer.merchants ?? null,
          transactions: employer.transactions ?? null,
        }));

        setEmployers(transformedData);
      } catch (error) {
        console.error('Error fetching employers:', error);
      }
    };

    fetchEmployers();
  }, []);

  const paginatedEmployers = applyPagination(employers, page, rowsPerPage);

  return (
    <>
      <Head>
        <title>{`Employers | Dashboard | ${config.site.name}`}</title>
      </Head>

      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Employers</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
                Import
              </Button>
              <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
                Export
              </Button>
            </Stack>
          </Stack>
          <div>
            {/*<Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
              Add
  </Button>*/}
          </div>
        </Stack>
        <EmployersFilters />
        <EmployersTable
          count={paginatedEmployers.length}
          page={page}
          rows={paginatedEmployers}
          rowsPerPage={rowsPerPage}
        />
      </Stack>
    </>
  );
}

function applyPagination(rows: Employer[], page: number, rowsPerPage: number): Employer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
