import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

export interface Transaction {
  paid_by: number;
  paid_to: number;
  store: number | null;
  paid_by_type: string | null;
  paid_to_type: string | null;
  amount: number;
  time_stamp: string;
}

export interface LatestOrdersProps {
  transactions?: Transaction[];
  sx?: SxProps;
}

export function LatestOrders({ transactions = [], sx }: LatestOrdersProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Latest Transactions" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800}}>
          <TableHead  sx={{ backgroundColor: '#CBA328'}}>
            <TableRow>
              <TableCell>Paid By</TableCell>
              <TableCell>Paid To</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow hover key={index}>
                <TableCell>{`${transaction.paid_by} (${transaction.paid_by_type || 'N/A'})`}</TableCell>
                <TableCell>{`${transaction.paid_to} (${transaction.paid_to_type || 'N/A'})`}</TableCell>
                <TableCell>{transaction.store || 'N/A'}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{dayjs(transaction.time_stamp).format('MMM D, YYYY HH:mm')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Link href="/dashboard/transactions" passHref>
          <Button
            color="inherit"
            endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
            size="small"
            variant="text"
          >
            View all transactions
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}