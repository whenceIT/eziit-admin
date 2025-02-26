"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { ArrowDown as ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowUp as ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { useUser } from "@/hooks/use-user";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

interface MerchantData {
  id: number;
  user_id: string;
  merchant_code: string;
  clients: { id: number }[];
}

async function fetchMerchantClients(merchantId: number): Promise<number> {
  try {
    console.log("Fetching merchant details for:", merchantId);
    const response = await fetch(`${API_BASE_URL}/merchant/${merchantId}`);

    if (!response.ok) {
      console.error("Failed to fetch merchant data");
      throw new Error("Failed to fetch merchant data");
    }

    const merchant: MerchantData = await response.json();

    // Ensure clients exist and count unique client IDs
    const uniqueClients = new Set(merchant.clients.map((client) => client.id));

    const clientCount = uniqueClients.size;
    console.log("Total clients under merchant:", clientCount);

    return clientCount;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Error fetching merchant clients");
  }
}

export interface TotalCustomersProps {
  diff?: number;
  trend: "up" | "down";
  sx?: SxProps;
  title: string;
}

export function TotalCustomers({ diff, trend, sx }: TotalCustomersProps): React.JSX.Element {
  const [totalClients, setTotalClients] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useUser();

  React.useEffect(() => {
    const countClients = async () => {
      if (!user) {
        console.log("User object is null or undefined");
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      if (user.user_type !== "merchant") {
        console.log("User is not a merchant");
        setError("Invalid user type");
        setLoading(false);
        return;
      }

      try {
        // Step 1: Fetch merchant details using user ID
        const merchantResponse = await fetch(`${API_BASE_URL}/merchants?user_id=${user.id}`);
        if (!merchantResponse.ok) {
          throw new Error(`Failed to fetch merchant details: ${merchantResponse.statusText}`);
        }
        const merchantData = await merchantResponse.json();
        console.log("Merchant Data:", merchantData);

        if (!merchantData || merchantData.length === 0) {
          throw new Error("No merchant account found for this user");
        }

        const userMerchant = merchantData.find((merchant: MerchantData) => merchant.user_id === user.id);
        if (!userMerchant) {
          throw new Error("No merchant account found for this user");
        }

        console.log("Found Merchant:", userMerchant);

        // Step 2: Fetch merchant details including client list
        const merchantDetailsResponse = await fetch(`${API_BASE_URL}/merchant/${userMerchant.id}`);
        if (!merchantDetailsResponse.ok) {
          throw new Error(`Failed to fetch merchant details: ${merchantDetailsResponse.statusText}`);
        }
        const merchantDetails: MerchantData = await merchantDetailsResponse.json();
        console.log("Merchant Details with Clients:", merchantDetails);

        if (!merchantDetails.clients || merchantDetails.clients.length === 0) {
          setTotalClients(0);
          setLoading(false);
          return;
        }

        // Step 3: Count unique clients
        const uniqueClients = new Set(merchantDetails.clients.map((client) => client.id));
        const clientCount = uniqueClients.size;

        setTotalClients(clientCount);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      countClients();
    }
  }, [user]);

  const TrendIcon = trend === "up" ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === "up" ? "var(--mui-palette-success-main)" : "var(--mui-palette-error-main)";

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Clients
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              ) : (
                <Typography variant="h4">{totalClients}</Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-success-main)", height: "56px", width: "56px" }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff && !loading && !error ? (
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              
             
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}