'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, CardHeader, Divider, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, CircularProgress, Alert } from '@mui/material';
import dayjs from 'dayjs';

interface Transaction {
  paid_by: number;
  paid_to: number;
  store: number | null;
  paid_by_type: string | null;
  paid_to_type: string | null;
  amount: number;
  time_stamp: string;
}

async function fetchTransactions(page: number, limit: number): Promise<{ transactions: Transaction[], total: number }> {
  const response = await fetch(`https://ezitt.whencefinancesystem.com/transactions?page=${page + 1}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  const data = await response.json();
  return { transactions: data.transactions || [], total: data.total || 0 };
}

export default function AllTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        let initialTransactions: Transaction[] = [];
        const storedTransactions = localStorage.getItem('initialTransactions');
        if (storedTransactions) {
          initialTransactions = JSON.parse(storedTransactions);
        }

        if (page === 0 && initialTransactions.length > 0) {
          setTransactions(initialTransactions);
          setTotal(initialTransactions.length);
          setLoading(false);
        } else {
          const data = await fetchTransactions(page, rowsPerPage);
          setTransactions(data.transactions);
          setTotal(data.total);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
        setLoading(false);
      }
    };

    loadTransactions();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader title="All Transactions" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Paid By</TableCell>
              <TableCell>Paid To</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <TableRow hover key={index}>
                  <TableCell>{`${transaction.paid_by} (${transaction.paid_by_type || 'N/A'})`}</TableCell>
                  <TableCell>{`${transaction.paid_to} (${transaction.paid_to_type || 'N/A'})`}</TableCell>
                  <TableCell>{transaction.store || 'N/A'}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{dayjs(transaction.time_stamp).format('MMM D, YYYY HH:mm')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No transactions found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Card>
  );
}