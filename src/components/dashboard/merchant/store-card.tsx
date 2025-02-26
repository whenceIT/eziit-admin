import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MapPin as MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Storefront as StorefrontIcon } from '@phosphor-icons/react/dist/ssr/Storefront';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';

export interface Store {
  id: number | null;
  merchant: number | null;
  merchantName: string;
  store_code: string | null;
  location: string | null;
}

export interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps): React.JSX.Element {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flex: '1 1 auto' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <StorefrontIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Box>
          <Stack spacing={1}>
            <Typography align="center" variant="h5">
              {store.store_code || 'N/A'}
            </Typography>
            <Typography align="center" variant="body2" color="text.secondary">
              ID: {store.id || 'N/A'}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <UserIcon fontSize="var(--icon-fontSize-sm)" />
          <Typography variant="body2">
          {store.merchant === null ? "No Associated Merchant" : store.merchantName}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <MapPinIcon fontSize="var(--icon-fontSize-sm)" />
          <Typography variant="body2">
            {store.location || 'Unknown Location'}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}