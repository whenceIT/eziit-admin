"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { useUser } from "@/hooks/use-user";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

interface Transaction {
  id: number;
  paid_by: string;
  paid_to: string;
  store: number | null;
  paid_by_type: string | null;
  paid_to_type: string | null;
  amount: number;
  time_stamp: string;
}

interface Column {
  id: "id" | "time_stamp" | "paid_by" | "paid_to" | "amount" | "store";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: "id", label: "Transaction ID", minWidth: 100 },
  { id: "time_stamp", label: "Date", minWidth: 100 },
  { id: "paid_by", label: "Paid By", minWidth: 170 },
  { id: "paid_to", label: "Paid To", minWidth: 170 },
  {
    id: "amount",
    label: "Amount",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD" }),
  },
  { id: "store", label: "Store", minWidth: 100 },
];

export default function MerchantTransactions(): React.JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useUser();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const transactionsResponse = await fetch(`${API_BASE_URL}/transactions`);
        if (!transactionsResponse.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const allTransactions: Transaction[] = await transactionsResponse.json();

        // Filter transactions for the logged-in user
        const userTransactions = allTransactions.filter(
          (transaction) => transaction.paid_by === user.id || transaction.paid_to === user.id,
        );

        // Fetch all users to get their names
        const usersResponse = await fetch(`${API_BASE_URL}/users`);
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const users = await usersResponse.json();

        // Create a map of user IDs to names
        const userMap = new Map(users.map((u: any) => [u.id, `${u.first_name} ${u.last_name}`]));

        // Replace user IDs with names in the transactions
        const transactionsWithNames = userTransactions.map((transaction) => ({
          ...transaction,
          paid_by: userMap.get(transaction.paid_by)?.toString() || transaction.paid_by,
          paid_to: userMap.get(transaction.paid_to)?.toString() || transaction.paid_to,
        }));

        setTransactions(transactionsWithNames);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={transaction.id}>
                      {columns.map((column) => {
                        const value = transaction[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === "number" ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={transactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}