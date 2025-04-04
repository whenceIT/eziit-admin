"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { useUser } from "@/hooks/use-user";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

interface EmployerData {
  id: number;
  user_id: string;
  clients: { id: number }[];
}

export interface TotalCustomersProps {
  diff?: number;
  trend: "up" | "down";
  sx?: SxProps;
  title: string;
}

export function TotalEmployees({ diff, trend, sx }: TotalCustomersProps): React.JSX.Element {
  const [totalClients, setTotalClients] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useUser();

  React.useEffect(() => {
    const countClients = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const employerResponse = await fetch(`${API_BASE_URL}/employers?user_id=${user.id}`);
        if (!employerResponse.ok) {
          throw new Error("Failed to fetch employer details");
        }
        const employerData = await employerResponse.json();

        if (!employerData || employerData.length === 0) {
          throw new Error("No employer account found for this user");
        }

        const userEmployer = employerData.find((employer: EmployerData) => employer.user_id === user.id);
        if (!userEmployer) {
          throw new Error("No employer account found for this user");
        }

        const employerDetailsResponse = await fetch(`${API_BASE_URL}/employer/${userEmployer.id}`);
        if (!employerDetailsResponse.ok) {
          throw new Error("Failed to fetch employer details");
        }
        const employerDetails: EmployerData = await employerDetailsResponse.json();

        const clientCount = employerDetails.clients ? employerDetails.clients.length : 0;
        setTotalClients(clientCount);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    countClients();
  }, [user]);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack alignItems="flex-start" direction="row" spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Total Employees
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Typography variant="h4">{totalClients}</Typography>
            )}
          </Stack>
          <Avatar sx={{ backgroundColor: "primary.main", height: 56, width: 56 }}>
            <UsersIcon size={32} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
