{/* manager cunderwriter view add api fetching here */}

import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';

import { config } from '@/config';
import { UnderwritersFilters } from '@/components/dashboard/underwriter/underwriters-filters';
import { UnderwritersTable } from '@/components/dashboard/underwriter/underwriters-table';
import type { Underwriter } from '@/components/dashboard/underwriter/underwriters-table';

export const metadata = { title: `Underwriters | Dashboard | ${config.site.name}` } satisfies Metadata;

const underwriters = [
  {
    id: 'USR-010',
    name: 'test',
    avatar: '/assets/avatar-10.png',
    email: 'test@gmail.com',
    phone: '0977112233',
    //address: { city: 'Lusaka' },
    //createdAt: dayjs().subtract(2, 'hours').toDate(),
  }

] satisfies Underwriter[];

export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 15;

  const paginatedUnderwriters = applyPagination(underwriters, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Underwriters</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            
            
          </Stack>
        </Stack>
        <div>
          
        </div>
      </Stack>
      <UnderwritersFilters />
      <UnderwritersTable
        count={paginatedUnderwriters.length}
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
