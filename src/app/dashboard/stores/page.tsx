'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import Head from 'next/head';

import { config } from '@/config';
import { StoresFilters } from '@/components/dashboard/store/stores-filters';
import { StoreCard, Store } from '@/components/dashboard/store/store-card';

const API_BASE_URL = 'https://ezitt.whencefinancesystem.com';

export default function Page(): React.JSX.Element {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  //const [searchTerm, setSearchTerm] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stores`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
  
      const storesWithMerchantNames = await Promise.all(data.map(async (store: any) => {
        let merchantName = 'Unknown Merchant';
        try {
          const merchantResponse = await fetch(`${API_BASE_URL}/merchants/${store.merchant}`);
          if (merchantResponse.ok) {
            const merchantData = await merchantResponse.json();
            if (merchantData.user_id) {
              const userResponse = await fetch(`${API_BASE_URL}/users/${merchantData.user_id}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                merchantName = `${userData.first_name} ${userData.last_name}`.trim();
              }
            }
          }
        } catch (error) {
          console.error('Error fetching merchant data:', error);
        }

        return {
          id: store.id ?? null,
          merchant: store.merchant ?? null,
          merchantName: merchantName,
          store_code: store.store_code ?? null,
          location: store.location ?? null,
        };
      }));
  
      setStores(storesWithMerchantNames);
      setFilteredStores(storesWithMerchantNames);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  }, []);
  
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

 /* const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    const lowercaseTerm = term.toLowerCase();
    const filtered = stores.filter(store => {
      const searchableFields = [
        store.merchantName,
        store.store_code,
        store.location,
        store.id?.toString()
      ];
      
      return searchableFields.some(field => {
        if (field === null) return false;
        const fieldValue = field.toLowerCase();
        return fieldValue.includes(lowercaseTerm) || 
               (isNaN(Number(lowercaseTerm)) ? false : fieldValue.includes(lowercaseTerm));
      });
    });
    setFilteredStores(filtered);
    setPage(1);
  }, [stores]);*/

  const paginatedStores = filteredStores.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      <Head>
        <title>{`Stores | Dashboard | ${config.site.name}`}</title>
      </Head>
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Stores</Typography>
          </Stack>
          
        </Stack>
        {/*<StoresFilters onSearch={handleSearch} />*/}
        <Grid container spacing={3}>
          {paginatedStores.map((store) => (
            <Grid key={store.id} lg={4} md={6} xs={12}>
              <StoreCard store={store} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={Math.ceil(filteredStores.length / rowsPerPage)} 
            page={page} 
            onChange={handlePageChange}
            size="small" 
          />
        </Box>
      </Stack>
    </>
  );
}