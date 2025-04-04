"use client"
//

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import { useRouter } from "next/navigation"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { useUser } from "@/hooks/use-user"
import { UnderwritersTable } from "@/components/dashboard/merchant/underwriters-table"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface Underwriter {
  id: number
  name: string
  employees: number
  organisation_name: string
  email: string
  status: string
}


export default function MerchantUnderwriters(): React.JSX.Element {
  const [underwriters, setUnderwriters] = React.useState<Underwriter[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()
  const router = useRouter()

  React.useEffect(() => {
      const fetchAllUnderwriters = async () => {
        if (!user?.id) {
          setError("User not authenticated")
          setLoading(false)
          return
        }
  
        try {
          // Fetch all underwriters from the database
          const underwritersResponse = await fetch(`${API_BASE_URL}/underwriters`)
          if (!underwritersResponse.ok) {
            throw new Error(`Failed to fetch underwriters: ${underwritersResponse.statusText}`)
          }
  
          const underwritersData = await underwritersResponse.json()
          console.log("All Underwriters Data:", underwritersData)
  
          // Process underwriter data
          const processedUnderwriters = await Promise.all(
            underwritersData.map(async (underwriter: any) => {
              try {
                // Fetch user details if user_id existss
                let name = "N/A"
                if (underwriter.user_id) {
                  const userResponse = await fetch(`${API_BASE_URL}/user/${underwriter.user_id}`)
                  if (userResponse.ok) {
                    const userData = await userResponse.json()
                    name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A"
                  }
                }
  
                return {
                  id: underwriter.id,
                  user_id: underwriter.user_id,
                  name: name,
                  email: underwriter.email || "N/A",
                  float: underwriter.float || 0,
                  merchants: underwriter.merchants || "N/A",
                  transactions: underwriter.transactions || "N/A",
                  employer: underwriter.employer_id ? `ID: ${underwriter.employer_id}` : "N/A",
                  ratings: underwriter.ratings || 0,
                  comments: underwriter.comments || "",
                  status: underwriter.status || "pending",
                }
              } catch (error) {
                console.error(`Error processing underwriter ${underwriter.id}:`, error)
                return {
                  id: underwriter.id,
                  user_id: underwriter.user_id,
                  name: "Error loading underwriter",
                  float: 0,
                  merchants: "N/A",
                  transactions: "N/A",
                  employer: "N/A",
                  ratings: 0,
                  comments: "",
                  status: "pending" as const,
                }
              }
            }),
          )
  
          setUnderwriters(processedUnderwriters)
          setLoading(false)
        } catch (err) {
          console.error("Error fetching data:", err)
          setError(err instanceof Error ? err.message : "An unknown error occurred")
          setLoading(false)
        }
      }
  
      fetchAllUnderwriters()
    }, [user])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(+event.target.value)
      setPage(0)
    }
  
     // Define the onViewDetails function
     const handleViewDetails = (underwriterId: number) => {
      router.push(`/merchant-dashboard/underwriters/${underwriterId}`);
    };
  
    if (loading) return <CircularProgress />
    if (error) return <Alert severity="error">{error}</Alert>
  
    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedUnderwriters = underwriters.slice(startIndex, endIndex)

    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Typography variant="h4" gutterBottom>
            All Underwriters
          </Typography>
          {underwriters.length === 0 ? (
            <Alert severity="info">No underwriters found.</Alert>
          ) : (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <UnderwritersTable 
                underwriters={paginatedUnderwriters}
                onViewDetails={handleViewDetails}
                count={underwriters.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    )
  }

