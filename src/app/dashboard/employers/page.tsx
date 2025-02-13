/*'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
//import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
//import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
//import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import Head from 'next/head';
import { config } from '@/config';
import { EmployersFilters } from '@/components/dashboard/employer/employers-filters';
import { EmployersTable, Employer } from '@/components/dashboard/employer/employers-table';
//import type { Employer } from '@/components/dashboard/employer/employers-table';

export default function Page(): React.JSX.Element {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  
    const fetchEmployers = useCallback(async () => {
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
          status: employer.status ?? null,
        }));

        setEmployers(transformedData);
        setFilteredEmployers(transformedData);
      } catch (error) {
        console.error('Error fetching employers:', error);
      }
    }, []);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  const handleFilter = useCallback((status: string | null) => {
    setActiveFilter(status);
    if (status === null) {
      setFilteredEmployers(employers);
    } else {
      const filtered = employers.filter((employer) => employer.status.toLowerCase() === status.toLowerCase());
      setFilteredEmployers(filtered);
    }
    setPage(0);
  }, [employers]);

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedEmployers = applyPagination(filteredEmployers, page, rowsPerPage);

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
            <Button 
                color={activeFilter === 'approved' ? 'primary' : 'inherit'}
                variant={activeFilter === 'approved' ? 'contained' : 'outlined'}
                onClick={() => handleFilter('approved')}
              >
                Approved
              </Button>
              <Button 
                color={activeFilter === 'pending' ? 'primary' : 'inherit'}
                variant={activeFilter === 'pending' ? 'contained' : 'outlined'}
                onClick={() => handleFilter('pending')}
              >
                Pending
              </Button>
              <Button 
                color={activeFilter === 'declined' ? 'primary' : 'inherit'}
                variant={activeFilter === 'declined' ? 'contained' : 'outlined'}
                onClick={() => handleFilter('declined')}
              >
                Declined
              </Button>
              {activeFilter && (
                <Button 
                  color="inherit"
                  variant="outlined"
                  onClick={() => handleFilter(null)}
                >
                  Clear Filter
                </Button>
              )}
            </Stack>
          </Stack>
          <div>
            {/*<Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
              Add
  </Button>*}
          </div>
        </Stack>
        <EmployersFilters />
        <EmployersTable
          count={filteredEmployers.length}
          items={paginatedEmployers}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Stack>
    </>
  );
}

function applyPagination(rows: Employer[], page: number, rowsPerPage: number): Employer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
*/