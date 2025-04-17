"use client";

import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { EmployersTable } from "@/components/dashboard/underwriter/employerstable";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

export interface Employer {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: number;
  ratings: number | null;
  organization: string;
}
//
export default function AllEmployers(): React.JSX.Element {
  const router = useRouter();
  const [employers, setEmployers] = React.useState<Employer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { user } = useUser();

  React.useEffect(() => {
    const fetchAllEmployers = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        // Fetch all employers from the database
        const employersResponse = await fetch(`${API_BASE_URL}/employers`);
        if (!employersResponse.ok) {
          throw new Error(`Failed to fetch employers: ${employersResponse.statusText}`);
        }

        const employersData = await employersResponse.json();
        console.log("All Employers Data:", employersData);

        // Process employer data
        const processedEmployers = await Promise.all(
          employersData.map(async (employer: any) => {
            try {
              // Fetch user details if user_id exists
              let name = "N/A";
              if (employer.user_id) {
                const userResponse = await fetch(`${API_BASE_URL}/user/${employer.user_id}`);
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A";
                }
              }

              return {
                id: employer.id,
                user_id: employer.user_id,
                name: name,
                email: employer.email || "N/A",
                phone: employer.phone || 0,
                ratings: employer.ratings || 0,
              };
            } catch (error) {
              console.error(`Error processing employer ${employer.id}:`, error);
              return {
                id: employer.id,
                user_id: employer.user_id,
                email: employer.email || "N/A",
                name: "Error loading employer",
                phone: 0,
                ratings: 0,
              };
            }
          }),
        );

        setEmployers(processedEmployers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchAllEmployers();
  }, [user]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Define the onViewDetails function
  const handleViewDetails = (employerId: number) => {
    router.push(`/underwriter-dashboard/employers/${employerId}`);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedEmployers = employers.slice(startIndex, endIndex);

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          All Employers
        </Typography>
        {employers.length === 0 ? (
          <Alert severity="info">No employers found.</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <EmployersTable 
              employers={paginatedEmployers} 
              onViewDetails={handleViewDetails} 
  
              count={employers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </Grid>
    </Grid>
  );
}