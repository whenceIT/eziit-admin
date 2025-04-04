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
import { ClientsTable } from "@/components/dashboard/underwriter/clientstable";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

interface ClientDetails {
  id: number;
  user_id: string; 
  underwriter_status: string;
  merchant_code: string;
  clients: { id: number }[];
  employers: { id: number }[];
}

export interface Client {
  id: number;
  user_id: number | null;
  name: string;
  float: number | null;
  merchants: string | null;
  phone: number | null;
  transactions: string | null;
  employer: string | null;
  ratings: number | null;
  comments: string | null;
  status: "approved" | "pending" | "declined";
}

export default function Clients(): React.JSX.Element {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const { user } = useUser();

  React.useEffect(() => {
    const fetchClients = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
      
                const response = await fetch(`${API_BASE_URL}/users/${user.id}/clients`)
                if (!response.ok) throw new Error(`Failed to fetch client relationships: ${response.statusText}`)
                
                const data = await response.json()
                console.log("Relationship API Response:", data)
        
                if (!data.clients || data.clients.length === 0) {
                  setClients([])
                  setLoading(false)
                  return
                }
        
                const clientDetails = await Promise.all(
                  data.clients.map(async (rel: any) => {
                    try {
                   
                      const clientUserId = rel.recipient_type === 'client' 
                        ? rel.recipient_id 
                        : rel.requester_id;
        
                    
                      const userResponse = await fetch(`${API_BASE_URL}/user/${clientUserId}`)
                      if (!userResponse.ok) throw new Error("User not found")
                      const userData = await userResponse.json()
        
                 
                      const clientResponse = await fetch(`${API_BASE_URL}/clients?user_id=${clientUserId}`)
                      if (!clientResponse.ok) throw new Error("Client record not found")
                      const clientData = await clientResponse.json()
                      
                
                      const clientRecord = Array.isArray(clientData) 
                        ? clientData.find((c: any) => c.user_id === clientUserId)
                        : clientData;
        
                      if (!clientRecord) throw new Error("No matching client record found")
        
                      return {
                        id: clientRecord.id,          
                        userId: userData.id,         
                        name: `${userData.first_name} ${userData.last_name}`,
                        email: userData.email,
                        phone: userData.phone || "N/A",
                        float: Number(clientRecord.float) || 0,
                        ratings: clientRecord.ratings
                      }
                    } catch (err) {
                      console.error(`Error loading client details:`, err)
                      return null
                    }
                  })
                )
        
          setClients(clientDetails.filter(Boolean) as Client[])
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Define the onViewDetails function
  const handleViewDetails = (clientId: number) => {
    router.push(`/underwriter-dashboard/clients/${clientId}`);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedClients = clients.slice(startIndex, endIndex);

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          My Clients
        </Typography>
        {clients.length === 0 ? (
          <Alert severity="info">No clients found for this underwriter.</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <ClientsTable clients={paginatedClients} onViewDetails={handleViewDetails} />
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={clients.length}
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