"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router"; // Import useRouter
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import type { SxProps } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import dayjs from "dayjs";
import { useUser } from "@/hooks/use-user";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

export interface Transaction {
  paid_by: string;
  paid_to: string;
  store: number | null;
  paid_by_type: string | null;
  paid_to_type: string | null;
  amount: number;
  time_stamp: string;
  id: number;
}

interface User {
  id: string;
  user_type: string;
  first_name: string;
  last_name: string;
}

interface Store {
  id: number;
  location: string;
}

interface Client {
  id: number;
  user_id: string;
  employer_id: number;
}

export interface LatestOrdersProps {
  transactions: Transaction[];
  sx?: SxProps;
  title: string;
}

export function LatestOrders({ sx }: LatestOrdersProps): React.JSX.Element {
  const { user } = useUser();
  const router = useRouter(); // Initialize useRouter
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Fetch all clients under the logged-in employer
        const employerId = user.id; // Assuming the logged-in user is the employer
        const clientsResponse = await fetch(`${API_BASE_URL}/clients?employer_id=${employerId}`);

        if (!clientsResponse.ok) {
          throw new Error("Failed to fetch clients");
        }

        const clientsData: Client[] = await clientsResponse.json();

        if (!clientsData || clientsData.length === 0) {
          setTransactions([]);
          setIsLoading(false);
          return;
        }

        // Step 2: Fetch transactions for each client
        const transactionMap = new Map<number, Transaction>(); // Use a Map to prevent duplicates

        await Promise.all(
          clientsData.map(async (client) => {
            try {
              // Fetch transactions where client is the payer
              const paidByResponse = await fetch(`${API_BASE_URL}/transactions_paid_by/${client.user_id}`);

              // Fetch transactions where client is the recipient
              const paidToResponse = await fetch(`${API_BASE_URL}/transactions_paid_to/${client.user_id}`);

              if (!paidByResponse.ok || !paidToResponse.ok) {
                console.warn(`Failed to fetch transactions for client ${client.user_id}`);
                return;
              }

              const paidByTransactions: Transaction[] = await paidByResponse.json();
              const paidToTransactions: Transaction[] = await paidToResponse.json();

              // Add transactions to the Map using transaction ID as the key
              [...paidByTransactions, ...paidToTransactions].forEach((transaction) => {
                if (
                  transaction &&
                  transaction.id &&
                  transaction.paid_by &&
                  transaction.paid_to &&
                  transaction.amount !== undefined &&
                  transaction.time_stamp
                ) {
                  transactionMap.set(transaction.id, transaction);
                }
              });
            } catch (err) {
              console.error(`Error fetching transactions for client ${client.user_id}:`, err);
            }
          }),
        );

        // Convert Map values to array
        const allTransactions = Array.from(transactionMap.values());

        // Sort transactions by date (newest first)
        allTransactions.sort((a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime());

        // Only keep the latest 5 transactions
        setTransactions(allTransactions.slice(0, 5));

        // Fetch users and stores for display
        const [usersResponse, storesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/stores`),
        ]);

        if (!usersResponse.ok || !storesResponse.ok) {
          throw new Error("Failed to fetch users or stores");
        }

        const [allUsers, allStores] = await Promise.all([usersResponse.json(), storesResponse.json()]);

        setUsers(allUsers);
        setStores(allStores);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  const getStoreLocation = (storeId: number | null) => {
    if (!storeId) return "N/A";
    const store = stores.find((s) => s.id === storeId);
    return store ? store.location : "Unknown Location";
  };

  const handleViewAllTransactions = () => {
    // Use router.push for navigation
    router.push("/employer-dashboard/transactions");
  };

  if (isLoading) {
    return (
      <Card sx={sx}>
        <CardHeader title="Loading transactions..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={sx}>
        <CardHeader title={error} />
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <Box sx={{ p: 3 }}>
        <h3>Latest Transactions</h3>
      </Box>
      <Divider />
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: "#CBA328" }}>
            <TableRow>
              <TableCell>Paid By</TableCell>
              <TableCell>Paid To</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Store Location</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow hover key={transaction.id}>
                <TableCell>{`${getUserName(transaction.paid_by)} (${transaction.paid_by_type || "N/A"})`}</TableCell>
                <TableCell>{`${getUserName(transaction.paid_to)} (${transaction.paid_to_type || "N/A"})`}</TableCell>
                <TableCell>{transaction.store || "N/A"}</TableCell>
                <TableCell>{getStoreLocation(transaction.store)}</TableCell>
                <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{dayjs(transaction.time_stamp).format("MMM D, YYYY HH:mm")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={handleViewAllTransactions} // Use onClick handler
        >
          View all Transactions
        </Button>
      </CardActions>
    </Card>
  );
}