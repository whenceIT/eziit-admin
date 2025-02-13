'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';

interface Transaction {
  amount: number;
}

async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch('https://ezitt.whencefinancesystem.com/transactions');
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
}

export interface ProcessedProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
}

export function Processed({ diff, trend, sx }: ProcessedProps): React.JSX.Element {
  const [totalFees, setTotalFees] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const calculateFees = async () => {
      try {
        const transactions = await fetchTransactions();
        const fees = transactions.reduce((total, transaction) => {
          //change based on fee percentage 
          return total + (transaction.amount * 0.05);
        }, 0);
        setTotalFees(fees);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to calculate fees');
        setLoading(false);
      }
    };

    calculateFees();
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Processed Payments
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error" variant="body2">{error}</Typography>
              ) : (
                <Typography variant="h4">K{totalFees?.toFixed(2)}</Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: '#CBA328', height: '56px', width: '56px' }}>
              <CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff && !loading && !error ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}