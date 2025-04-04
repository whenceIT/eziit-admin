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

interface UnderwriterData {
  id: number;
  user_id: string;
  underwriter_code: string;
  clients: { id: number }[];
}

async function fetchUnderwriterClients(underwriterId: number): Promise<number> {
  try {
    console.log("Fetching underwriter details for:", underwriterId);
    const response = await fetch(`${API_BASE_URL}/underwriter/${underwriterId}`);

    if (!response.ok) {
      console.error("Failed to fetch underwriter data");
      throw new Error("Failed to fetch underwriter data");
    }

    const underwriter: UnderwriterData = await response.json();

    // Ensure clients exist and count unique client IDs
    const uniqueClients = new Set(underwriter.clients.map((client) => client.id));

    const clientCount = uniqueClients.size;
    console.log("Total clients under underwriter:", clientCount);

    return clientCount;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Error fetching underwriter clients");
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

      if (user.user_type !== "underwriter") {
        console.log("User is not a underwriter");
        setError("Invalid user type");
        setLoading(false);
        return;
      }

      try {
        // Step 1: Fetch underwriter details using user ID
        const underwriterResponse = await fetch(`${API_BASE_URL}/underwriters?user_id=${user.id}`);
        if (!underwriterResponse.ok) {
          throw new Error(`Failed to fetch underwriter details: ${underwriterResponse.statusText}`);
        }
        const underwriterData = await underwriterResponse.json();
        console.log("Underwriter Data:", underwriterData);

        if (!underwriterData || underwriterData.length === 0) {
          throw new Error("No underwriter account found for this user");
        }

        const userUnderwriter = underwriterData.find((underwriter: UnderwriterData) => underwriter.user_id === user.id);
        if (!userUnderwriter) {
          throw new Error("No underwriter account found for this user");
        }

        console.log("Found Underwriter:", userUnderwriter);

        //Fetch underwriter details including client list
        const underwriterDetailsResponse = await fetch(`${API_BASE_URL}/underwriter/${userUnderwriter.id}`);
        if (!underwriterDetailsResponse.ok) {
          throw new Error(`Failed to fetch underwriter details: ${underwriterDetailsResponse.statusText}`);
        }
        const underwriterDetails: UnderwriterData = await underwriterDetailsResponse.json();
        console.log("Underwriter Details with Clients:", underwriterDetails);

        if (!underwriterDetails.clients || underwriterDetails.clients.length === 0) {
          setTotalClients(0);
          setLoading(false);
          return;
        }

        // Step 3: Count unique clients
        const uniqueClients = new Set(underwriterDetails.clients.map((client) => client.id));
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