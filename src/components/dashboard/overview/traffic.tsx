'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Storefront as StorefrontIcon } from '@phosphor-icons/react/dist/ssr/Storefront';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

const iconMapping = { Clients: UsersIcon, Merchants: StorefrontIcon } as Record<string, Icon>;

export interface TrafficProps {
  sx?: SxProps;
}

export function Traffic({ sx }: TrafficProps): React.JSX.Element {
  const [chartSeries, setChartSeries] = React.useState<number[]>([]);
  const [labels, setLabels] = React.useState<string[]>(['Clients', 'Merchants']);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsResponse, merchantsResponse] = await Promise.all([
          fetch('https://ezitt.whencefinancesystem.com/clients'),
          fetch('https://ezitt.whencefinancesystem.com/merchants')
        ]);

        if (!clientsResponse.ok || !merchantsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const clientsData = await clientsResponse.json();
        const merchantsData = await merchantsResponse.json();

        const clientCount = clientsData.length;
        const merchantCount = merchantsData.length;
        const total = clientCount + merchantCount;

        setChartSeries([
          (clientCount / total) * 100,
          (merchantCount / total) * 100
        ]);

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = useChartOptions(labels);

  if (isLoading) {
    return <Card sx={sx}><CardContent>Loading...</CardContent></Card>;
  }

  if (error) {
    return <Card sx={sx}><CardContent>{error}</CardContent></Card>;
  }

  return (
    <Card sx={sx}>
      <CardHeader title="User Distribution" />
      <CardContent>
        <Stack spacing={2}>
          <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {chartSeries.map((item, index) => {
              const label = labels[index];
              const Icon = iconMapping[label];

              return (
                <Stack key={label} spacing={1} sx={{ alignItems: 'center' }}>
                  {Icon ? <Icon fontSize="var(--icon-fontSize-lg)" /> : null}
                  <Typography variant="h6">{label}</Typography>
                  <Typography color="text.secondary" variant="subtitle2">
                    {item.toFixed(1)}%
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [theme.palette.warning.main, theme.palette.success.main],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}