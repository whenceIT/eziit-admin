"use client";

import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { EmployersTable } from "@/components/dashboard/merchant/employers-table";
import { useUser } from "@/hooks/use-user";
//import { Employer } from "@/types/user";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

interface Employer {
  id: number;
  name: string;
  organisation_name: string;
  email: string;
  phone?: string | null; 
  user_type: string;
  permission: string;
}

export default function MerchantEmployers(): React.JSX.Element {
  const [employers, setEmployers] = React.useState<Employer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { user } = useUser();

  React.useEffect(() => {
    const fetchEmployers = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }
  
      
try {
      
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/employers`)
        if (!response.ok) throw new Error(`Failed to fetch employer relationships: ${response.statusText}`)
        
        const data = await response.json()
        console.log("Relationship API Response:", data)

        if (!data.employers || data.employers.length === 0) {
          setEmployers([])
          setLoading(false)
          return
        }

        const employerDetails = await Promise.all(
          data.employers.map(async (rel: any) => {
            try {
              const employerUserId = rel.recipient_type === 'employer' 
                ? rel.recipient_id 
                : rel.requester_id;


              const userResponse = await fetch(`${API_BASE_URL}/user/${employerUserId}`)
              if (!userResponse.ok) throw new Error("User not found")
              const userData = await userResponse.json()

    
              const employerResponse = await fetch(`${API_BASE_URL}/employers?user_id=${employerUserId}`)
              if (!employerResponse.ok) throw new Error("Employer record not found")
              const employerData = await employerResponse.json()
              
              // Find the employer record for this user
              const employerRecord = Array.isArray(employerData) 
                ? employerData.find((c: any) => c.user_id === employerUserId)
                : employerData;

              if (!employerRecord) throw new Error("No matching employer record found")

              return {
                id: employerRecord.id,          
                userId: userData.id,       
                name: `${userData.first_name} ${userData.last_name}`,
                email: userData.email,
                phone: userData.phone || "N/A",
               //float: Number(employerRecord.float) || 0,
                //ratings: employerRecord.ratings
              }
            } catch (err) {
              console.error(`Error loading employer details:`, err)
              return null
            }
          })
        )

        setEmployers(employerDetails.filter(Boolean) as Employer[])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching employers:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchEmployers()
  }, [user])

  
  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
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
        My Employers
      </Typography>
      {employers.length === 0 ? (
        <Alert severity="info">No employers found for this merchant.</Alert>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <EmployersTable 
            employers={paginatedEmployers}
            count={employers.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Grid>
  </Grid>
);
}