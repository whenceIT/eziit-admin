'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react';
import Head from 'next/head';
import { config } from '@/config';
import { MerchantsFilters } from '@/components/dashboard/merchant/merchants-filters';
import { MerchantsTable, Merchant } from '@/components/dashboard/merchant/merchants-table';

export default function Page(): React.JSX.Element {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const fetchMerchants = useCallback(async () => {
    try {
      const response = await fetch('https://ezitt.whencefinancesystem.com/merchants'); 
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
  
      const transformedData = data.map((merchant: any) => ({
        id: merchant.id ?? null,
        user_id: merchant.user_id ?? null,
        merchant_code: merchant.merchant_code ?? 'N/A',
        transactions: merchant.transactions ?? 'N/A',
        stores: merchant.stores ?? 'N/A',
        ratings: merchant.ratings ?? 'N/A',
        comments: merchant.comments ?? 'N/A',
        clients: merchant.clients ?? 'N/A',
        employers: merchant.employers ?? 'N/A',
        status: merchant.status ?? 'N/A',
      }));
  
      setMerchants(transformedData);
      setFilteredMerchants(transformedData);
    } catch (error) {
      console.error('Error fetching merchants:', error);
    }
  }, []);
  

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleFilter = useCallback((status: string | null) => {
    setActiveFilter(status);
    if (status === null) {
      setFilteredMerchants(merchants);
    } else {
      const filtered = merchants.filter((merchant) => merchant.status.toLowerCase() === status.toLowerCase());
      setFilteredMerchants(filtered);
    }
    setPage(0);
  }, [merchants]);

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedMerchants = applyPagination(filteredMerchants, page, rowsPerPage);

  return (
    <>
      <Head>
        <title>{`Merchants | Dashboard | ${config.site.name}`}</title>
      </Head>

      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Merchants</Typography>
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
            {/*<Button startIcon={<PlusIcon size={24} />} variant="contained">
              Add
              </Button>*/}
          </div>
        </Stack>
        <MerchantsFilters />
        <MerchantsTable
          count={filteredMerchants.length}
          items={paginatedMerchants}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Stack>
    </>
  );
}

function applyPagination(rows: Merchant[], page: number, rowsPerPage: number): Merchant[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

