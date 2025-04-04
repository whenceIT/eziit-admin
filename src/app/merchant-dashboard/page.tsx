"use client";

import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { TotalCustomers } from "@/components/dashboard/merchantOverview/clients";
import { TotalEmployers } from "@/components/dashboard/merchantOverview/employers";
import { Outstanding } from "@/components/dashboard/merchantOverview/outstandingPayments";
import { Processed } from "@/components/dashboard/merchantOverview/processedPayments";
import { Sales } from "@/components/dashboard/merchantOverview/totalTransactions";
import { LatestOrders } from "@/components/dashboard/merchantOverview/latestTransactions";
import { useUser } from "@/hooks/use-user";
import { Transaction, User } from "@/types/user";
//
interface Store {
  id: number;
  location: string;
}

async function fetchTransactions(user: User | null): Promise<Transaction[]> {
  if (!user) throw new Error("User not authenticated");

  const url =
    user.user_type === "merchant"
      ? `https://ezitt.whencefinancesystem.com/transactions?limit=6&merchantId=${user.id}`
      : "https://ezitt.whencefinancesystem.com/transactions?limit=6";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return await response.json();
}

export default function MerchantDashboard(): React.JSX.Element {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useUser();

  React.useEffect(() => {
    if (user) {
      fetchTransactions(user)
        .then((data) => {
          setTransactions(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching transactions:", err);
          setError("Failed to load transactions. Please try again later.");
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers diff={16} trend="down" sx={{ height: "100%" }} title="Number of Clients" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalEmployers diff={16} trend="down" sx={{ height: "100%" }} title="Number of Employers" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Outstanding sx={{ height: "100%" }} value={0} title="Outstanding Payments" trend="up" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Processed diff={12} trend="up" sx={{ height: "100%" }} title="Processed Payments" />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: "This month", data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: "Last month", data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: "100%" }}
          title="Total Transactions"
        />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <LatestOrders transactions={transactions} sx={{ height: "100%" }} title="Latest Transactions" />
        )}
      </Grid>
    </Grid>
  );
}